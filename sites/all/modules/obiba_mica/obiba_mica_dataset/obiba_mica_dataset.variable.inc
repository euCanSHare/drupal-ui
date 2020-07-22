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
 * Implements hook_variable_info().
 */

function obiba_mica_dataset_variable_info($options) {
  _obiba_mica_dataset_variable_content($variable);
  _obiba_mica_dataset_variable_variable_content($variable);
  return $variable;
}

/**
 * Setting Variable content page.
 */
function _obiba_mica_dataset_variable_content(&$variable) {
  $variable['dataset_detailed_crosstab'] = array(
    'title' => t('Show the Crosstab Button'),
    'description' => t('If selected, the Crosstab Button will be displayed.'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['dataset_title_acronym_setup'] = array(
    'title' => t('Show acronym on the title'),
    'description' => t('If selected, the acronym is shown in the title page.'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['dataset_show_harmonization_studies'] = array(
    'title' => t('Show harmonization studies'),
    'description' => t('If selected the harmonization Studies section will be displayed'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['dataset_show_collected_studies'] = array(
    'title' => t('Show Collected studies'),
    'description' => t('If selected the Collected Studies section will be displayed'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['dataset_detail_show_search_button'] = array(
    'title' => t('Show the search variables button in the dataset page'),
    'description' => t('If selected the search variables button will be displayed in the dataset page'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['dataset_description_overview_field'] = array(
    'title' => t('Show description inside overview'),
    'description' => t('If selected, dataset description is shown as a plain text inside the overview section.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
    $variable['obiba_mica_dataset_harmonization_status'] = array(
        'title' => t('Harmonization Status configuration '),
        'description' => t('Harmonization table configuration '),
        'type' => 'string',
        'default' => obiba_dataset_harmonization_default_settings(),
    );
  $variable['obiba_mica_dataset_studies_table_show_variable'] = array(
    'title' => t('Show the variables column in the studies table'),
    'description' => t('If selected the variables column will be shown in the studies table'),
    'type' => 'string',
    'default' => false,
  );
}
/**
 * Setting Variable content page.
 */
function _obiba_mica_dataset_variable_variable_content(&$variable) {
  $variable['variable_show_studies'] = array(
    'title' => t('Show studies'),
    'description' => t('If selected the Studies section will be displayed'),
    'type' => 'string',
    'default' => TRUE,
  );
  $variable['variable_show_networks'] = array(
    'title' => t('Show networks'),
    'description' => t('If selected the Networks section will be displayed'),
    'type' => 'string',
    'default' => TRUE,
  );
  $variable['mica_all_variables_dataschema'] = array(
    'title' => t('Rename to Dataschema all Dataschema and Harmonized Variables'),
    'description' => t('If selected, all Dataschema variables and Harmonized variables will display their type as Dataschema.'),
    'type' => 'boolean',
    'default' => FALSE,
  );
  $variable['dataset_detailed_var_stats'] = array(
    'title' => t('Show detailed harmonization variable data statistics'),
    'description' => t('If selected, detailed data summary and crosstab statistics about each harmonized variables will be displayed when querying the harmonization variable data statistics.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['mica_statistics'] = array(
    'title' => t('Show data statistics'),
    'description' => t('If selected, variable pages will include a statistics summary section and a link to the crosstab page.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['variable_algorithm'] = array(
    'title' => t('Show harmonization algorithms'),
    'description' => t('If selected, the harmonization algorithms will be displayed in the harmonized dataset and in the harmonized variable pages.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
}
