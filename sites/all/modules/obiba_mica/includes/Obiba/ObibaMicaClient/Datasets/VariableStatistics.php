<?php
/**
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file
 * Code to deal with variable statics.
 */
namespace Obiba\ObibaMicaClient\Datasets;

use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;

$path_module_study = drupal_get_path('module', 'obiba_mica_study');
include_once($path_module_study . '/includes/obiba_mica_study_resource.inc');

/**
 * VariableStatistics class
 */
class VariableStatistics {
  private $variable;
  private $variableStat;
  private $micaConfig;
  public $datasetDetailedVarStats;

  /**
   * Instance initialisation.
   *
   * @param object $variable
   *   The variable to extract statistics.
   * @param object $variable_stat
   *   The variable aggregations.
   * @param MicaConfig\MicaConfigInterface $micaConfig .
   *   The interface injected
   */
  public function __construct($variable, $variable_stat, MicaConfig\MicaConfigInterface $micaConfig) {
    $this->micaConfig = $micaConfig;
    $this->variable = $variable;
    $this->variableStat = $variable_stat;
    $this->datasetDetailedVarStats = $this->micaConfig->MicaGetConfig('dataset_detailed_var_stats');
  }

  /**
   * Table of descriptive statistics or frequencies.
   */
  public function asTable() {
      if (!empty($this->variableStat->total)) {
        if (!empty($this->variableStat->statistics)) {
          return $this->asDescriptiveTable();
        }
        if (!empty($this->variableStat->frequencies)) {
          return $this->asFrequenciesTable();
        }
      }
      return '<div class="alert alert-info">' . t('No statistics found for this variable.') . '</div>';
  }

  /**
   * Chart of frequencies only.
   */
  public function asChart() {
      if (!empty($this->variableStat->statistics)) {
        return FALSE;
        // May be need to review :
        // return $this->asStackedBarChart();
      }
      return $this->asPieChart();
  }

  /**
   * Chart as stacked bar.
   */
  private function asStackedBarChart() {
    if (!empty($this->variableStat->frequencies)) {
      $aggregations = $this->getAggregations();
      $labels = array();
      $data = array();
      // Add category frequencies first.
      if (!empty($this->variable->categories)) {
        foreach ($this->variable->categories as $category) {
          $labels[] = $this->getCategoryLabel($category);
          foreach ($aggregations as $aggregation) {
            if (!empty($aggregation->frequencies)) {
              $header = $this->getStudyTableLabel($aggregation);
              foreach ($aggregation->frequencies as $frequency) {
                if ($frequency->value == $category->name) {
                  $data[$header][] = $frequency->count;
                  break;
                }
              }
            }
          }
        }
      }
      // Look for values that are not categories observed that are missing.
      $observed_values = $this->getObservedValues($aggregations, TRUE);
      foreach ($observed_values as $observed) {
        $labels[] = $observed;
        foreach ($aggregations as $aggregation) {
          if (!empty($aggregation->frequencies)) {
            $header = $this->getStudyTableLabel($aggregation);
            $count = 0;
            foreach ($aggregation->frequencies as $frequency) {
              if ($frequency->value == $observed) {
                $count = $frequency->count;
                break;
              }
            }
            $data[$header][] = $count;
          }
        }
      }
      // Observed that are valid, merged into one.
      if (!empty($this->variableStat->statistics)) {
        $labels[] = 'N (' . t('Valid values') . ')';
        foreach ($aggregations as $aggregation) {
          $header = $this->getStudyTableLabel($aggregation);
          $data[$header][] = empty($aggregation->n) ? 0 : $aggregation->n;
        }
      }
      if (!empty($data)) {
        $to_render = obiba_mica_graphic_stacked_column_chart($labels, $data, t('Valid and other values frequencies'), NULL, 400, 'none');
        return render($to_render);
      }
      else {
        return FALSE;
      }
    }
    return FALSE;
  }

  /**
   * Combined pie chart.
   */
  private function asPieChart() {
    $response = new \stdClass();
    $response->charts = array();
    if (!empty($this->variableStat)) {
      if (!empty($this->variableStat->frequencies) && !empty($this->variable->categories)) {
        $category_names = array_reduce($this->variable->categories, function ($result, $category) {
            $result[$category->name] = obiba_mica_dataset_variable_attributes_detail($category, 'label');
          return $result;
        });

        $filtered = array_filter($this->variableStat->frequencies, function ($f) { return !$f->missing && $f->count > 0; });
        $data = array();

        foreach ($filtered as $f) {
          if (array_key_exists($f->value, $category_names)) {
            $item = new \stdClass();
            $item->key = $f->value;
            $item->title = $category_names[$f->value] . ' (' . $f->value . ')' ;
            $item->value = $f->count;
            array_push($data, $item);
          }
        }

        array_push($response->charts, array(
          'title' => '',
          'data' => $data,
          'color' => obiba_mica_graphic_charts_colors_options_settings(),
          'showLegend' => variable_get_value('graphics_piechart_legend')
        ));
      }
      return $response;
    }
    else {
      return FALSE;
    }
  }

  /**
   * Mix category name and localized label in one string.
   */
  private function getCategoryLabel($category) {
    $label = obiba_mica_dataset_variable_attributes_detail($category, 'label');
    if (empty($label)) {
      $label = $category->name;
    }
    else {
      $label = $category->name . ' (' . $label . ')';
    }
    return $label;
  }

  /**
   * From a value, search for a corresponding category and get its label.
   */
  private function getLabelFromCategoryName($value, $html = TRUE) {
    if ($value == NULL || $value == '' || empty($this->variable->categories)) {
      return $value;
    }
    foreach ($this->variable->categories as $category) {
      if ($value == $category->name) {
        $label = obiba_mica_dataset_variable_attributes_detail($category, 'label');
        return $html ? '<span title="' . $label . '">' . $value . '</span>' : $value . ' (' . $label . ')';
      }
    }
    return $value;
  }

  /**
   * Mix study localized acronym with study table localized name.
   *
   * If any in one string.
   */
  private function getStudyTableLabel($aggregation) {
    $table = !empty($aggregation->studyTable) ? $aggregation->studyTable : $aggregation->harmonizationStudyTable;
    $header = obiba_mica_commons_get_localized_field(_obiba_mica_variable_study_summary($aggregation), 'acronym');
    if (!empty($table->name)) {
      $header = $header . '(' . obiba_mica_commons_get_localized_field($table, 'name') . ')';
    }
    return $header;
  }

  /**
   * Get the variable statistics as an aggregation list.
   */
  private function getAggregations() {
    $aggregations = array();
    if (!empty($this->variableStat->aggregations)) {
      $aggregations = $this->variableStat->aggregations;
    }
    else {
      array_push($aggregations, $this->variableStat);
    }
    return $aggregations;
  }

  /**
   * Look for occurrences of values that are not categories.
   */
  private function getObservedValues($aggregations, $missing = NULL) {
    $observed_values = array();
    foreach ($aggregations as $aggregation) {
      if (!empty($aggregation->frequencies)) {
        foreach ($aggregation->frequencies as $frequency) {
          if (!in_array($frequency->value, $observed_values) && !$this->isCategory($frequency->value)) {
            if (empty($missing) || $frequency->missing == $missing) {
              $observed_values[] = $frequency->value;
            }
          }
        }
      }
    }
    return $observed_values;
  }

  /**
   * Check if value is a category name of the current variable.
   */
  private function isCategory($value) {
    if ($value == NULL || $value == '') {
      return FALSE;
    }
    if (empty($this->variable->categories)) {
      return FALSE;
    }
    foreach ($this->variable->categories as $category) {
      if ($value == $category->name) {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Table of descriptive statistics.
   */
  private function asDescriptiveTable() {
    $rows = array();
    $aggregations = array();
    if ($this->datasetDetailedVarStats && $this->variable->variableType == 'Dataschema') {
      if (!empty($this->variableStat->aggregations)) {
        $aggregations = $this->variableStat->aggregations;
      }
    }
    else {
      array_push($aggregations, $this->variableStat);
    }
    // Frequencies of missing.
    $missings = array();
    if (!empty($this->variableStat->frequencies)) {
      $missing_end = array();
      foreach ($this->variableStat->frequencies as $frequency) {
        if ($frequency->value != 'NOT_NULL') {
          if ($frequency->value == 'N/A') {
            $missing_end = $frequency->value;
          }
          else {
            array_push($missings, $frequency->value);
          }
        }
      }
      if (!empty($missing_end)) {
        array_push($missings, $missing_end);
      }
    }
    // Statistics.
    foreach ($aggregations as $aggregation) {
      $row = array();
      if ($this->datasetDetailedVarStats && $this->variable->variableType == 'Dataschema') {
        $row[] = $this->getTableHeader($aggregation);
      }
      $row = array_merge($row, $this->statisticsToRow($aggregation));
      foreach ($missings as $missing) {
        $count = 0;
        if (!empty($aggregation->frequencies)) {
          foreach ($aggregation->frequencies as $frequency) {
            if ($frequency->value == $missing) {
              $count = $frequency->count;
              $pct = empty($aggregation->total) ? 0 : round(($count / $aggregation->total) * 100, 1);
              $count = obiba_mica_commons_format_number($count) .
                '<p class="help-inline" title="Percentage over total count">' . obiba_mica_commons_format_number($pct, 1) . '%</p>';
              break;
            }
          }
        }
        $row[] = $count;
      }
      $row[] = empty($aggregation->total) ? '-' : obiba_mica_commons_format_number($aggregation->total);
      $rows[] = $row;
    }
    // Combined statistics.
    if ($this->datasetDetailedVarStats && $this->variable->variableType == 'Dataschema') {
      $row = array();
      if ($this->datasetDetailedVarStats) {
        $row[] = array('data' => '<strong>' . t('All') . '</strong>');
      }
      $row = array_merge($row, $this->statisticsToRow($this->variableStat));
      $aggregation = $this->variableStat;
      foreach ($missings as $missing) {
        $count = 0;
        if (!empty($aggregation->frequencies)) {
          foreach ($aggregation->frequencies as $frequency) {
            if ($frequency->value == $missing) {
              $count = $frequency->count;
              $pct = empty($aggregation->total) ? NULL : round(($count / $aggregation->total) * 100, 1);
              $count = empty($pct) ? '0' : obiba_mica_commons_format_number($count) .
                '<p class="help-inline" title="Percentage over total count">' . obiba_mica_commons_format_number($pct, 1) . '%</p>';
              break;
            }
          }
        }
        $row[] = $count;
      }
      $row[] = empty($aggregation->total) ? '-' : obiba_mica_commons_format_number($aggregation->total);
      $rows[] = $row;
    }
    // Headers.
    $headers = array();
    if ($this->datasetDetailedVarStats && $this->variable->variableType == 'Dataschema') {
      $headers = array(t('Study'));
    }
    array_push($headers, t('Min'), t('Max'), t('Mean'), t('Std. Dev'), t('N'));
    foreach ($missings as $missing) {
      $label = $this->getLabelFromCategoryName($missing);
      $label = $label == 'N/A' ? t('Missing') : $label;
      array_push($headers, $label);
    }
    array_push($headers, t('Total'));
    return theme('table', array(
      'header' => $headers,
      'rows' => $rows,
      'empty' => t('No statistics available'),
    ));
  }

  private function getTableHeader($aggregation) {
    $table = !empty($aggregation->studyTable) ? $aggregation->studyTable : $aggregation->harmonizationStudyTable;
    $study_id = $table->studyId;
    $study_summary = _obiba_mica_variable_study_summary($aggregation);
    $study_acronym = obiba_mica_commons_get_localized_field($study_summary, 'acronym');

    if (!empty($aggregation->studyTable)) {
      $header = !empty($study_summary->published)?l($study_acronym, 'mica/' . \DrupalMicaStudyResource::INDIVIDUAL_STUDY . '/' . $study_id):$study_acronym;
      if (!empty($aggregation->studyTable->name)) {
        $header = $header . ' ' . obiba_mica_commons_get_localized_field($aggregation->studyTable, 'name');
      }
    } else if (!empty($aggregation->harmonizationStudyTable)) {
      $header = !empty($study_summary->published)?l($study_acronym, 'mica/' . \DrupalMicaStudyResource::HARMONIZATION_STUDY . '/' . $study_id):$study_acronym;
      if (!empty($aggregation->harmonizationStudyTable->name)) {
        $header = $header . ' ' . obiba_mica_commons_get_localized_field($aggregation->harmonizationStudyTable, 'name');
      }
    }
    return !empty($header) ? $header : '';
  }

  /**
   * Table of value frequencies.
   */
  private function asFrequenciesTable() {
    $headers = array(t('Value'));
    $rows = array();
    $missing_rows = array();
    $aggregations = array();
    // Headers.
    if ($this->datasetDetailedVarStats && $this->variable->variableType == 'Dataschema') {
      if (!empty($this->variableStat->aggregations)) {
        $aggregations = $this->variableStat->aggregations;
        foreach ($aggregations as $aggregation) {
          $headers[] = $this->getTableHeader($aggregation);
        }
        if (count($aggregations) > 1) {
          $headers[] = t('All');
          array_push($aggregations, $this->variableStat);
        }
      }
    }
    else {
      array_push($headers, t('Frequency'));
      array_push($aggregations, $this->variableStat);
    }
    // Counts per valid/missing values.
    $colspan = count($aggregations) + 1;
    $rows[] = array(
      array(
        'data' => '<strong>' . t('Valid Values') . '</strong>',
        'colspan' => $colspan,
      ),
    );
    $missing_rows[] = array(
      array(
        'data' => '<strong>' . t('Other Values') . '</strong>',
        'colspan' => $colspan,
      ),
    );
    // Categories first.
    if (!empty($this->variable->categories)) {
      foreach ($this->variable->categories as $category) {
        $category_name = $category->name;
        $category_label = obiba_mica_dataset_variable_attributes_detail($category, 'label');
        $missing = $category->missing;
        $row = array(
          array(
            'data' => $category->name . '<p class="help-inline">' . $category_label . '</p>',
            'data-toggle' => 'tooltip',
            'data-original-title' => $category_label,
          ),
        );
        $value = $category_name;
        foreach ($aggregations as $aggregation) {
          $count = 0;
          if (!empty($aggregation->frequencies)) {
            foreach ($aggregation->frequencies as $frequency) {
              if ($frequency->value == $value) {
                $count = $frequency->count;
                if ($frequency->missing) {
                  $count = $this->countMarkup($count, $aggregation->total, $aggregation->total - $aggregation->n, t('Percentage over other values count'));
                }
                else {
                  $count = $this->countMarkup($count, $aggregation->total, $aggregation->n, t('Percentage over valid values count'));
                }
                break;
              }
            }
          }
          $row[] = $count;
        }
        if (!$missing) {
          $rows[] = $row;
        }
        else {
          $missing_rows[] = $row;
        }
      }
    }
    // Observed values.
    $observed_values = $this->getObservedValues($aggregations);
    foreach ($observed_values as $observed_value) {
      $label = $observed_value == 'NOT_NULL' ? t('Valid values') : $observed_value;
      $label = $observed_value == 'N/A' ? t('Missing') : $label;
      $row = array($label);
      $missing = TRUE;
      foreach ($aggregations as $aggregation) {
        $count = 0;
        if (!empty($aggregation->frequencies)) {
          foreach ($aggregation->frequencies as $frequency) {
            if ($frequency->value == $observed_value) {
              // Expected to be the same through the aggregations.
              $missing = $frequency->missing;
              $count = $frequency->count;
              if ($frequency->missing) {
                $count = $this->countMarkup($count, $aggregation->total, $aggregation->total - $aggregation->n, t('Percentage over other values count'));
              }
              else {
                $count = $this->countMarkup($count, $aggregation->total, $aggregation->n, t('Percentage over valid values count'));
              }
              break;
            }
          }
        }
        $row[] = $count;
      }
      if (!$missing) {
        // Do not include those non-categorical details.
        // $rows[] = $row;
      }
      else {
        $missing_rows[] = $row;
      }
    }
    // Subtotal valid values.
    $row = array('<i>' . t('Subtotal') . '</i>');
    foreach ($aggregations as $aggregation) {
      $row[] = $this->countMarkup($aggregation->n, $aggregation->total);
    }
    $rows[] = $row;
    // Subtotal missing values.
    if (count($missing_rows) > 1) {
      // Total missing.
      $row = array('<i>' . t('Subtotal') . '</i>');
      foreach ($aggregations as $aggregation) {
        $row[] = $this->countMarkup($aggregation->total - $aggregation->n, $aggregation->total);
      }
      $missing_rows[] = $row;
      $rows = array_merge($rows, $missing_rows);
    }
    // Grand total.
    $row = array(
      array(
        'data' => '<strong>' . t('Total') . '</strong>',
        'class' => array('active'),
      ),
    );
    foreach ($aggregations as $aggregation) {
      $row[] = array(
        'data' => obiba_mica_commons_format_number($aggregation->total),
        'class' => array('active'),
      );
    }
    $rows[] = $row;
    return theme('table', array(
      'header' => $headers,
      'rows' => $rows,
      'empty' => t('No statistics available'),
    ));
  }

  /**
   * Count markup.
   */
  private function countMarkup($count, $total = 0, $subtotal = 0, $title = NULL) {
    $percent_total = $total > 0 ? round(($count / ($total)) * 100, 1) : 0;
    $percent = $subtotal > 0 ? round(($count / $subtotal) * 100, 1) : 0;
    $total_title = t('Percentage over total count');
    if (!empty($title)) {
      return obiba_mica_commons_format_number($count)
      . '<div class="help-inline" data-toggle="tooltip" title="" data-original-title="' . $total_title . '">' .
      obiba_mica_commons_format_number($percent_total, 1) . '%</div><div class="help-inline" data-toggle="tooltip" title="" data-original-title="' .
      $title . '"><i>(' . obiba_mica_commons_format_number($percent, 1) . '%)</i></div>';
    }
    return obiba_mica_commons_format_number($count) .
    '<p class="help-inline" data-toggle="tooltip" title="" data-original-title="' . $total_title . '">' .
    $percent_total . '%</p>';
  }

  /**
   * Wrap statistics to row.
   */
  private function statisticsToRow($aggregation) {
    if (!empty($aggregation->statistics)) {
      $statistics = $aggregation->statistics;
      $pct = empty($aggregation->total) ? 0 : round(($aggregation->n / $aggregation->total) * 100, 1);
      $n = obiba_mica_commons_format_number($aggregation->n) . '<p class="help-inline" title="Percentage over total count">' . obiba_mica_commons_format_number($pct) . '%</p>';
      return array(
        property_exists($statistics, 'min') ? obiba_mica_commons_format_number(round($statistics->min, 1), 1) : '-',
        property_exists($statistics, 'max') ? obiba_mica_commons_format_number(round($statistics->max, 1), 1) : '-',
        property_exists($statistics, 'mean') && property_exists($statistics, 'stdDeviation') ?
          obiba_mica_commons_format_number(round($statistics->mean, 1), 1) : '-',
        property_exists($statistics, 'stdDeviation') ? obiba_mica_commons_format_number(round($statistics->stdDeviation, 1), 1) : '-',
        $n,
      );
    }
    else {
      return array(
        '-',
        '-',
        '-',
        '-',
        '-',
      );
    }
  }
}