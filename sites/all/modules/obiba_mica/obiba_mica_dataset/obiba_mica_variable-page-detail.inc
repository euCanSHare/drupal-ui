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
 * Code for variable details page.
 */

include_once 'includes/obiba_mica_dataset_commons.inc';
include_once 'includes/obiba_mica_dataset_resource.inc';

use Obiba\ObibaMicaClient\Datasets as Datasets;
//TODO have to remove from here must be in obiba\ObibaMicaClient Module only
use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;
use Obiba\ObibaMicaClient\MicaLocalisation as MicaLocalisation;

/**
 * Variable page detail.
 */
function obiba_mica_variable_page_detail($variable_id) {
  drupal_add_js(drupal_get_path('module', 'obiba_mica_dataset') . '/js/obiba_mica_variable_harmo_algo_datatable_init.js', 'file');
  drupal_add_js(drupal_get_path('module', 'obiba_mica_dataset') . '/js/obiba_mica_dataset_get_ajax_variables.js', 'file');
  drupal_add_js(array('obiba_mica_variable' => array()), 'setting');

  obiba_mica_app_angular_load_js_resources('obiba_mica_graphic');

  $url_param = explode('?', request_uri());
  $url_query = NULL;
  if (!empty($url_param[1])) {
    parse_str($url_param[1], $url_query);
  }

  $variable_resource = new DrupalMicaDatasetResource();
  $variable = $variable_resource->getVariable($variable_id);
  $localize = new MicaLocalisation\MicaDrupalLocalization();

  if (empty($variable)) {
    drupal_set_title(t('Variable not found'));
    return '';
  }
  if ($variable->variableType == "Dataschema") {
    $algos = TRUE;
  }
  $variable->label = obiba_mica_dataset_variable_category_detail($variable, 'label');
  $variable->description = obiba_mica_dataset_variable_category_detail($variable, 'description');
  $variable->comment = obiba_mica_dataset_variable_category_detail($variable, 'comment');

  obiba_mica_dataset_remove_harmonization_taxonomy($variable);
  //ToDo May be removed if we decide to not show the main Harmonization stusyon a specific variable detail page
  $dataset = $variable_resource->getDataset($variable->datasetId);
  $themed_variable = theme('obiba_mica_variable-detail', array(
    'harmonization_table_legend' => theme('obiba_mica_dataset-harmonization-table-legend', array('clickable' => $variable->variableType != 'Harmonized')),
    'dataset_harmonization_study' => !empty($dataset->{'obiba.mica.HarmonizedDatasetDto.type'}->harmonizationTable) ? $dataset->{'obiba.mica.HarmonizedDatasetDto.type'}->harmonizationTable->studySummary : null,
    'variable_dto' => $variable,
    'show_variable_type_as_dataschema' => variable_get_value('mica_all_variables_dataschema') && $variable->variableType != 'Collected',
    'variable_harmonization_algorithms' => !empty($algos) ? $algos : NULL,
    'variable_harmonization' => obiba_mica_dataset_variable_get_harmonization($variable),
  ));

  $title = $variable->name;
  if ($variable->variableType == 'Harmonized') {
    if (!empty($url_query['title'])) {
      $title = $url_query['title'];
    }
    else {
      $title .= ' -- ' . (obiba_mica_commons_get_localized_field($variable->studySummaries[0], 'acronym'));
    }
  }

  drupal_set_title($title);

  $dataset_type = $variable->variableType == DrupalMicaDatasetResource::COLLECTED_VARIABLE ? DrupalMicaDatasetResource::COLLECTED_DATASET : DrupalMicaDatasetResource::HARMONIZED_DATASET;

  $path_type = ANGULAR_LIST_HARMONIZED_DATASETS;
  if($dataset_type == DrupalMicaDatasetResource::COLLECTED_DATASET ){
    $path_type = ANGULAR_LIST_COLLECTED_DATASETS;
  }
  drupal_set_breadcrumb(array(
    l(t('Home'), '<front>'),
    l($localize->getTranslation('datasets'), DrupalMicaDatasetResource::DATASETS, array('fragment' => MicaListsHelper::datasetFragment(ANGULAR_LIST_DATASETS))),
    l(($dataset_type == DrupalMicaDatasetResource::COLLECTED_DATASET ?
      $localize->getTranslation('collected-datasets') : $localize->getTranslation('harmonized-datasets')),
      DrupalMicaDatasetResource::DATASETS . '/' .  $dataset_type,
      array('fragment' => MicaListsHelper::datasetFragment($path_type))),
    l(obiba_mica_commons_get_localized_field($variable, 'datasetName'), 'mica/' . obiba_mica_dataset_varibale_type($variable)
      . '/' . $variable->datasetId),
  ));
  return $themed_variable;
}

/**
 * Variables information.
 */
function obiba_mica_dataset_get_variable_info($variable_id) {
  $dataset_resource = new DrupalMicaDatasetResource();
  $variable_dto = $dataset_resource->getVariable($variable_id);
  drupal_json_output($variable_dto);
}

/**
 * Variables summary.
 */
function obiba_mica_dataset_get_variable_summary($variable_id) {
  $dataset_resource = new DrupalMicaDatasetResource();
  $variable_summary_dto = $dataset_resource->getVariableSummary($variable_id);
  drupal_json_output($variable_summary_dto);
}

/**
 * Ajax Callback to get variable algorithm.
 */
function obiba_mica_dataset_get_variable_algorithm($variable_id, $sorted_variable_names) {
  $sorted_variables = json_decode($sorted_variable_names, TRUE);
  $variable_resource = new DrupalMicaDatasetResource();
  $harmonization_variables = $variable_resource->getVariableHarmonizations($variable_id);
  foreach ($harmonization_variables->datasetVariableSummaries as $harmonization_variable) {
    $variable_resolver = $harmonization_variable->resolver;
    $study_id = $variable_resolver->studyId;

    $variable_title = $variable_resolver->name . ' -- ' . $study_id;
    if (!empty($harmonization_variable->studyTable->name)) {
      $variable_title = $variable_title . ' (' . obiba_mica_commons_get_localized_field($harmonization_variable->studyTable, 'name') . ')';
    }
    $algorithm = obiba_mica_dataset_variable_attributes_detail($harmonization_variable, 'algorithm', array(
      'maelstrom',
      'Mlstr_harmo',
    ));
    if (empty($algorithm)) {
      // No need to render.
      unset($sorted_variables[$variable_title]);
    }
    else {
      if (array_key_exists($variable_title, $sorted_variables)) {
        $sorted_variables[$variable_title] = array(
          'var_id' => $variable_resolver->id,
          'var_detail' => obiba_mica_commons_markdown($algorithm),
        );
      }
    }
  }

  $themed_algo['algo'] = empty($sorted_variables)
    ? NULL
    : theme( 'obiba_mica_variable_harmonization_algorithm',
      array('variable_harmonization_algorithms' => $sorted_variables));

  drupal_json_output($themed_algo);
}

/**
 * Remove harmonization taxonomies.
 */
function obiba_mica_dataset_remove_harmonization_taxonomy($variable) {

  if (!empty($variable->termAttributes)) {
    $variable->termAttributes = array_filter($variable->termAttributes, function ($term_attribute) {
      return $term_attribute->taxonomy->name !== 'Mlstr_harmo';
    });
  }

}

/**
 * Check if the variables has harmonizations status detail
 *
 * @param $variable
 * @return bool
 */
function obiba_mica_dataset_variable_has_satus_detail_harmonizations($variable) {
  $variable_resource = new DrupalMicaDatasetResource();
  $variable_harmonizations = $variable_resource->getVariableHarmonizations($variable->id);
  if (!empty($variable_harmonizations->datasetVariableSummaries)) {
    foreach ($variable_harmonizations->datasetVariableSummaries as $variable_harmonization) {
      $status_detail = obiba_mica_dataset_variable_attributes_detail($variable_harmonization, 'status_detail', array(
        'Mlstr_harmo',
      ));
      if (!empty($status_detail)) {
          return TRUE;
        }
    }
  }
  return FALSE;
}

/**
 * Called to get js that inject a harmonization dataset dataTable.
 */
function obiba_mica_dataset_variable_get_harmonizations($variable) {
  $has_status_destail= NULL;
  if (drupal_get_library('obiba_mica_dataset', 'datatables')) {
    drupal_add_library('obiba_mica_dataset', 'datatables');
  }
  else {
    obiba_mica_commons_datatables_external_source();
  }
  $has_status_detail = obiba_mica_dataset_variable_has_satus_detail_harmonizations($variable);
  drupal_add_js(drupal_get_path('module', 'obiba_mica_dataset') . '/js/obiba_mica_dataset_variable_harmo_datatable_init.js', 'file');
  drupal_add_js(array(
    'table_headers' => obiba_mica_dataset_variable_get_harmonization_table_headers($variable, $has_status_detail),
    'table_data' => obiba_mica_dataset_variable_get_harmonization_table_rows($variable, $has_status_detail),
  ), 'setting');
}

/**
 * GEt harmonized variable header table.
 */
function obiba_mica_dataset_variable_get_harmonization_table_headers($variable, $has_status_detail = NULL) {
  $localize = new MicaLocalisation\MicaDrupalLocalization();
  $header =  array(
    array("title" => $localize->getTranslation('client.label.variable.harmonized-variable'), 'width' => '20%'),
    array("title" => $localize->getTranslation('study.label')),
    array("title" => $localize->getTranslation('study.data-collection-event'), 'width' => '40%'),
    array("title" => $localize->getTranslation('status'), 'width' => '5%'),
    array($has_status_detail?"title":"" => $has_status_detail?$localize->getTranslation('client.label.variable.status-detail'):"", $has_status_detail?'width':'' => $has_status_detail?'10%':''),
    array("title" => $localize->getTranslation('comment-label')),
  );
  return array_filter($header);
}

/**
 * GEt harmonized variable row data table.
 */
function obiba_mica_dataset_variable_get_harmonization_table_rows($variable, $has_status_detail = NULL) {
  $rows = array();
  $variable_resource = new DrupalMicaDatasetResource();

  $variable_harmonizations = $variable_resource->getVariableHarmonizations($variable->id);
    $harmonization_status_configurations = variable_get_value('obiba_mica_dataset_harmonization_status');
  if (!empty($variable_harmonizations->datasetVariableSummaries)) {
    foreach ($variable_harmonizations->datasetVariableSummaries as $variable_harmonization) {
      $variable_resolver = $variable_harmonization->resolver;
      $harmonized_variable_id = $variable_resolver->id;
      $entity_id = $variable_resolver->studyId;

      if (property_exists($variable_harmonization, 'studyTable')) {
        $opal_table = $variable_harmonization->studyTable;
        $entity_summary = $opal_table->studySummary;
        $entity_acronym = obiba_mica_commons_get_localized_field($entity_summary, 'acronym');
        $entity_link = DrupalMicaStudyResource::anchorStudy($entity_summary);
        $dce_dataset_title = obiba_mica_dataset_get_dce_name_from_dataset($opal_table, $entity_summary);
      } else if (property_exists($variable_harmonization, 'harmonizationStudyTable')) {
        $opal_table = $variable_harmonization->harmonizationStudyTable;
        $entity_summary = $opal_table->studySummary;
        $entity_acronym = obiba_mica_commons_get_localized_field($entity_summary, 'acronym');
        $entity_link = DrupalMicaStudyResource::anchorStudy($entity_summary);
        $dce_dataset_title = '';
      }

      $variable_title = $variable->name . ' -- ' . $entity_acronym;
      $variable_title_key = $variable->name . ' -- ' . $entity_id;
      if (!empty($opal_table->name)) {
        $variable_title = $variable_title . ' (' . obiba_mica_commons_get_localized_field($opal_table, 'name') . ')';
        $variable_title_key .= ' (' . obiba_mica_commons_get_localized_field($opal_table, 'name') . ')';
      }

      $harmonization_status = trim(strtolower(obiba_mica_dataset_variable_attributes_detail($variable_harmonization, 'status', array(
        'maelstrom',
        'Mlstr_harmo',
      ))));
        $status = '<span data-toggle="tooltip" class="' . $harmonization_status_configurations[$harmonization_status]['icon'] . '" title="' . $harmonization_status_configurations[$harmonization_status]['title'] . '"></span>';

      $status_detail = obiba_mica_dataset_variable_attributes_detail($variable_harmonization, 'status_detail', array(
        'maelstrom',
        'Mlstr_harmo',
      ));
      $comment =  obiba_mica_dataset_variable_attributes_detail($variable_harmonization, 'comment', array(
        'maelstrom',
        'Mlstr_harmo',
        ));
      $rows[] = array(
        '<p>' .
        l($variable_title, 'mica/variable/' . $harmonized_variable_id, array(
          'query' => array(
            'title' => $variable_title,
          ),
        )) . '</p><p class="help-block">' . obiba_mica_commons_get_localized_field($opal_table, 'description') . '</p>',
        $entity_link,
        $dce_dataset_title,
        l($status, 'mica/variable/' . $harmonized_variable_id, array(
          'html' => TRUE,
          'query' => array(
            'title' => $variable_title,
          ),
        )),
        $has_status_detail ? ucfirst($status_detail) : '' ,
         !empty($comment)?obiba_mica_commons_markdown($comment):'-',
        $variable_title_key,
      );

    }
  }

  return array_filter($rows);
}

/**
 * Get variable harmonization table.
 */
function obiba_mica_dataset_variable_get_harmonization($harmonized_variable) {
  return array(
    'status' => obiba_mica_dataset_variable_attributes_detail($harmonized_variable, 'status', array(
      'maelstrom',
      'Mlstr_harmo',
    )),
    'status_detail' => obiba_mica_dataset_variable_attributes_detail($harmonized_variable, 'status_detail', array(
      'maelstrom',
      'Mlstr_harmo',
    )),
    'comment' => obiba_mica_dataset_variable_attributes_detail($harmonized_variable, 'comment', array(
      'maelstrom',
      'Mlstr_harmo',
    )),
    'algorithm' => obiba_mica_commons_markdown(obiba_mica_dataset_variable_attributes_detail($harmonized_variable, 'algorithm', array(
      'maelstrom',
      'Mlstr_harmo',
    ))),
    'script' => obiba_mica_dataset_variable_attributes_detail($harmonized_variable, 'script'),
  );
}

/**
 * Get a truncated snippet of a given variable attribute.
 */
function obiba_mica_dataset_variable_html_truncated($text, $label, $size = 200) {
  if (!empty($text)) {
    $truncate = strlen($text) > $size;
    $html_truncate = $truncate ?
      check_markup(truncate_utf8($text, $size, FALSE)) . "[" . $label . " " . t("truncated") . "]" :
      check_markup($text);
  }
  else {
    $html_truncate = '-';
  }
  return $html_truncate;
}

/**
 * Get variable categories table.
 */
function obiba_mica_dataset_variable_get_categories($categories = NULL) {
  $localize = new MicaLocalisation\MicaDrupalLocalization();
  $rows = array();
  if (!empty($categories)) {
    foreach ($categories as $category) {
      $rows[] = array(
        $category->name,
        obiba_mica_dataset_variable_category_detail($category, 'label'),
        $category->missing ? '<span class="glyphicon glyphicon-ok"></span>' : NULL,
      );
    }
    return theme(
      'table',
      array(
        'header' => array($localize->getTranslation('name'), $localize->getTranslation('search.variable.label'), $localize->getTranslation('client.label.missing')),
        'rows' => $rows,
        'empty' => t('No category found'),
        'sticky' => FALSE,
      )
    );
  }

  return FALSE;
}

function obiba_mica_dataset_get_statistics($variable_id = NULL){
  $variable_id = explode('?title', $variable_id)[0];
  $cached_variable_statistics = obiba_mica_commons_get_cache(__FUNCTION__ . 'variable-statistics-' . $variable_id);
  if (!empty($cached_variable_statistics)) {
    return $cached_variable_statistics;
  }
  else {
    $variable_resource = new DrupalMicaDatasetResource();
    $variable = $variable_resource->getVariable($variable_id);
    $variable_stat = $variable_resource->getVariableAggregation($variable_id);
    try{
      //TODO have to Not instantiate VariableStatistics from here have to use an intermediate class that extend them
      $statistics = new Datasets\VariableStatistics($variable, $variable_stat, new MicaConfig\MicaDrupalConfig());
      $stat_tab['table'] = $statistics->asTable();
      $stat_tab['chart'] = $statistics->asChart();
      obiba_mica_commons_set_cache(__FUNCTION__ . 'variable-statistics-' . $variable_id, $stat_tab);
      return $stat_tab;
    }catch (Exception $e){
      watchdog('obiba_mica','Unable to retrieve statistics . Error code : @code, message: @message', array(
        '@code' => $e->getCode(),
        '@message' => $e->getMessage()
      ));
    }
  }
}

function obiba_mica_dataset_variable_ng_coverage($variable_id = NULL) {
  $coverages = json_encode(new stdClass());
  if (!variable_get_value('mica_statistics')) {
    return $coverages;
  }
  $stat_tab = obiba_mica_dataset_get_statistics($variable_id);
  if (!empty($stat_tab['chart'])) {
    return drupal_json_output($stat_tab['chart']);
  }
  return $coverages;
}

/**
 * Callback to get variable statistics charts/table.
 */
function obiba_mica_dataset_variable_get_ajax_statistics($variable_id = NULL) {
  if (!variable_get_value('mica_statistics')) {
    return FALSE;
  }
    $stat_tab = obiba_mica_dataset_get_statistics($variable_id);
    if (!empty($stat_tab['table'])) {
      return drupal_json_output($stat_tab);
    }
  return FALSE;
}

/**
 * Get the study summary found in the variable.
 *
 * If not found, fetch the study summary directly.
 */
function _obiba_mica_variable_study_summary($variable_aggregation) {
  if(!empty($variable_aggregation->studyTable) && !empty($variable_aggregation->studyTable->studySummary)){
    return $variable_aggregation->studyTable->studySummary;
  } else if(!empty($variable_aggregation->harmonizationStudyTable) && !empty($variable_aggregation->harmonizationStudyTable->studySummary)){
    return $variable_aggregation->harmonizationStudyTable->studySummary;
  }

  return new stdClass();
}
