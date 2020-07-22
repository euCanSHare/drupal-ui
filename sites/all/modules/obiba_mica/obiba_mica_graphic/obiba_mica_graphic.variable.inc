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
 * Obiba Mica Graphics variable file
 */

$path_module_commons = drupal_get_path('module', 'obiba_mica_graphic');
include_once($path_module_commons . '/obiba_mica_graphic.admin.inc');

/**
 * Implements hook_variable_info().
 */
function obiba_mica_graphic_variable_info($options) {

  $variable['graphic_label'] = array(
    'title' => t('Statistics graphic Label'),
    'description' => t('The Statistics graphic section title'),
    'type' => 'string',
    'default' => 'Catalogue Statistics graphic',
  );

  $variable['graphics_blocks'] = array(
    'title' => t('Statistics graphic bocks'),
    'description' => t('Enable the Statistics graphic in some blocks'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['graphics_blocks_networks'] = array(
    'title' => t('Concerned Networks Statistics'),
    'description' => t('Please select the Concerned networks'),
    'type' => 'options',
    'default' => '',
  );

  $variable['graphics_blocks_aggregations'] = array(
    'title' => t('Aggregations statistics'),
    'description' => t('Please select the Aggregations statistics to show, and fill free to add a custom css'),
    'type' => 'string',
    'default' => array(
      NetworkStatistics::GEO_NBR_STAT => array(
        'value' => 'populations-selectionCriteria-countriesIso',
        'value_name' => 'col-md-6',
        'weight' => '-10',
        'enable' => 1,
      ),
      NetworkStatistics::METHODS_DESIGNS => array(
        'value' => 'methods-designs',
        'value_name' => 'col-md-6',
        'weight' => '-9',
        'enable' => 1,
      ),
      NetworkStatistics::NUMBER_PARTICIPANTS => array(
        'value' => 'numberOfParticipants-participant-number-range',
        'value_name' => 'col-md-6',
        'weight' => '-8',
        'enable' => 1,
      ),
      NetworkStatistics::BIO_SAMPLES => array(
        'value' => 'populations-dataCollectionEvents-bioSamples',
        'value_name' => 'col-md-6',
        'weight' => '-7',
        'enable' => 1,
      ),
    ),
  );

  $variable['graphics_content'] = array(
    'title' => t('Statistics graphic in networks page '),
    'description' => t('Enable the Statistics graphic in networks page'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['graphics_piechart_legend'] = array(
    'title' => t('Show Pie Chart legend '),
    'description' => t('Enable the legends for Pie Chart graphics'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['mica_graphic_colors'] = array(
    'title' => t('Used colors on the graphics'),
    'description' => t('Select your desired colors'),
    'type' => 'string',
    'default' => array(
      'color1' => array(
        'value' => 'color1',
        'value_name' => '#92afe0',
        'weight' => '-10',
        'enable' => 1,
      ),
      'color2' => array(
        'value' => 'color2',
        'value_name' => '#809bc7',
        'weight' => '-9',
        'enable' => 1,
      ),
      'color3' => array(
        'value' => 'color3',
        'value_name' => '#758db5',
        'weight' => '-8',
        'enable' => 1,
      ),
      'color4' => array(
        'value' => 'color4',
        'value_name' => '#5b6e8d',
        'weight' => '-7',
        'enable' => 1,
      ),
      'color5' => array(
        'value' => 'color5',
        'value_name' => '#414e64',
        'weight' => '-6',
        'enable' => 1,
      ),
      'color6' => array(
        'value' => 'color6',
        'value_name' => '#000000',
        'weight' => '-5',
        'enable' => 0,
      ),
      'color7' => array(
        'value' => 'color7',
        'value_name' => '#000000',
        'weight' => '-4',
        'enable' => 0,
      ),
      'color8' => array(
        'value' => 'color8',
        'value_name' => '#000000',
        'weight' => '-3',
        'enable' => 0,
      ),
      'color9' => array(
        'value' => 'color9',
        'value_name' => '#000000',
        'weight' => '-2',
        'enable' => 0,
      ),
      'color10' => array(
        'value' => 'color10',
        'value_name' => '#000000',
        'weight' => '-1',
        'enable' => 0,
      ),
    ),
  );

  $variable['graphics_barChart_rotateLabels'] = array(
    'title' => t('Coverage graphics x axis labels rotation'),
    'description' => t('Set the Coverage graphics x axis labels rotation'),
    'type' => 'string',
    'default' => '-15',
  );

  $variable['graphics_barChart_numberBars'] = array(
    'title' => t('Coverage graphics Number of chart bars when apply  customs setting'),
    'description' => t('Set the Number of chart bars to apply  customs setting Coverage to ensure maximum of graphics visibilities'),
    'type' => 'string',
    'default' => '5',
  );

  $variable['graphics_barChart_graphicMargins_left'] = array(
    'title' => t('Coverage graphics margin left'),
    'description' => t('Set the Coverage graphics margin left'),
    'type' => 'string',
    'default' => '150',
  );

  $variable['graphics_barChart_graphicMargins_top'] = array(
    'title' => t('Coverage graphics margin top'),
    'description' => t('Set the Coverage graphics margin top'),
    'type' => 'string',
    'default' => '0',
  );
  $variable['graphics_barChart_graphicMargins_right'] = array(
    'title' => t('Coverage graphics margin right'),
    'description' => t('Set the Coverage graphics margin right'),
    'type' => 'string',
    'default' => '0',
  );
  $variable['graphics_barChart_graphicMargins_bottom'] = array(
    'title' => t('Coverage graphics margin bottom'),
    'description' => t('Set the Coverage graphics margin bottom'),
    'type' => 'string',
    'default' => '50',
  );

  $variable['graphics_barChart_rotateLabels'] = array(
    'title' => t('Coverage graphics x axis labels rotation'),
    'description' => t('Set the Coverage graphics x axis labels rotation'),
    'type' => 'string',
    'default' => '-15',
  );

  $variable['graphics_barChart_enableEllipses'] = array(
    'title' => t('Coverage graphics x axis labels enable Ellipses'),
    'description' => t('Enable Ellipses the Coverage graphics x axis labels'),
    'type' => 'boolean',
    'default' => FALSE,
  );

  $variable['graphics_horizontal_barChart_graphic_margins_left'] = array(
    'title' => t('Coverage graphics margin left'),
    'description' => t('Set the Coverage graphics margin left'),
    'type' => 'string',
    'default' => '500',
  );

  $variable['graphics_horizontal_barChart_truncated'] = array(
    'title' => t('Number of characters to truncate'),
    'description' => t('Set the number of characters to truncate term title'),
    'type' => 'string',
    'default' => '0',
  );

    $variable['graphics_table_headerAlignment'] = array(
        'title' => t('Header title alignment'),
        'description' => t('Select the alignment of the header title (left, center, right).'),
        'type' => 'string',
        'default' => 'text-left',
    );
    $variable['graphics_table_valuesAlignment'] = array(
        'title' => t('Values alignment'),
        'description' => t('Select the alignment of the values of the table (left, center, right).'),
        'type' => 'string',
        'default' => 'text-left',
    );
    $variable['graphics_table_useMonoFont'] = array(
        'title' => t('Use the Monospace Class font'),
        'description' => t('Enable a "mono-font" css class that will apply a configured monospace font to the graphics table values.'),
        'type' => 'boolean',
        'default' => NULL,
    );
    $variable['graphics_table_fixWidth'] = array(
        'title' => t('Fixed width for numeric table values'),
        'description' => t('If enabled the numeric table values will have a fixed width (longest numeric value length).'),
        'type' => 'boolean',
        'default' => NULL,
    );

  return $variable;
}
