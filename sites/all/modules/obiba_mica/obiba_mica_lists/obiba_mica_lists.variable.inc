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
* Obiba Mica LIsts variable file
*/

/**
* Implements hook_variable_info().
*/
function obiba_mica_lists_variable_info($options) {
  _obiba_mica_lists_study_config($variable);
  _obiba_mica_lists_network_config($variable);
  _obiba_mica_lists_dataset_config($variable);
  return $variable;
}

/**
 * Implements hook_action_info().
 */
function _obiba_mica_lists_study_config(&$variable) {
  $variable['obiba_mica_lists_display_study_facets'] = array(
    'title' => t('Display the study facets properties'),
    'description' => t('If selected the study facets properties will be displayed on the Studies list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_list_show_studies_count_caption'] = array(
    'title' => t('Show the studies count caption in the study list page'),
    'description' => t('If selected the studies count caption will be displayed in the study list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_list_show_search_form'] = array(
    'title' => t('Show the rapid search/sort form in the study list page'),
    'description' => t('If selected the rapid search/sort form will be displayed in the study list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_list_show_study_sup_info'] = array(
    'title' => t('Show supplementary details study in the study list page'),
    'description' => t('If selected the supplementary details study badges will be displayed in the study list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_list_show_trimmed_description_study'] = array(
    'title' => t("Show trimmed description details study, with 'Read more' link in the study list page"),
    'description' => t("If selected the description details study will be displayed in the study list page with a 'Read more' link"),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_list_show_variables_count_badge'] = array(
    'title' => t("Show variables count"),
    'description' => t("Shows the count of related variables and if pressed, navigates to the search page."),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['studies_list_show_datasets_count_badge'] = array(
    'title' => t("Show datasets count"),
    'description' => t("Shows the count of related datasets and if pressed, navigates to the search page."),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['studies_list_show_networks_count_badge'] = array(
    'title' => t("Show networks count"),
    'description' => t("Shows the count of related networks and if pressed, navigates to the search page."),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['study_list_show_search_button'] = array(
    'title' => t('Show the search studies button in the study list page'),
    'description' => t('If selected the search studies button will be displayed in the study list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['study_list_name_acronym_sort'] = array(
    'title' => t('Set the study result default sort order'),
    'description' => t('Select the default sort for the study list'),
    'type' => 'string',
    'default' => 'name'
  );

  $variable['study_list_default_order_sort'] = array(
    'title' => t('Set the Study result order'),
    'description' => t('Select the default sorted order for the Study list'),
    'type' => 'string',
    'default' => ''
  );

  $variable['harmo_studies_list_show_study_sup_info'] = array(
    'title' => t('Show supplementary details harmonization study in the study list page'),
    'description' => t('If selected the supplementary details harmonization study badges will be displayed in the study list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['harmo_studies_list_show_trimmed_description_study'] = array(
    'title' => t("Show trimmed description details harmonization study, with 'Read more' link in the study list page"),
    'description' => t("If selected the description details harmonization study will be displayed in the study list page with a 'Read more' link"),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['harmo_studies_list_show_variables_count_badge'] = array(
    'title' => t("Show variables count"),
    'description' => t("Shows the count of related variables and if pressed, navigates to the search page."),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['harmo_studies_list_show_datasets_count_badge'] = array(
    'title' => t("Show datasets count"),
    'description' => t("Shows the count of related datasets and if pressed, navigates to the search page."),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['harmo_studies_list_show_networks_count_badge'] = array(
    'title' => t("Show networks count"),
    'description' => t("Shows the count of related networks and if pressed, navigates to the search page."),
    'type' => 'boolean',
    'default' => TRUE,
  );



}

function _obiba_mica_lists_network_config(&$variable) {
  $variable['obiba_mica_lists_display_network_facets'] = array(
    'title' => t('Display the network facets properties'),
    'description' => t('If selected the network facets properties will be displayed on the Networks list page'),
    'type' => 'boolean',
    'default' => 0,
  );

  $variable['network_list_show_search_button'] = array(
    'title' => t('Show the search networks button in the network list page'),
    'description' => t('If selected the search networks button will be displayed in the network list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['network_list_default_order_sort'] = array(
    'title' => t('Set the Network result order'),
    'description' => t('Select the sorted order for the Network list'),
    'type' => 'string',
    'default' => ''
  );

  $variable['network_list_default_field_sort'] = array(
    'title' => t('Set the Network result sort order'),
    'description' => t('Select the sort type for the network list'),
    'type' => 'string',
    'default' => 'name'
  );
}

function _obiba_mica_lists_dataset_config(&$variable) {
  $variable['obiba_mica_lists_display_datset_facets'] = array(
    'title' => t('Display the Dataset facets properties'),
    'description' => t('If selected the Dataset facets properties will be displayed on the Datasets list page'),
    'type' => 'boolean',
    'default' => 0,
  );

  $variable['dataset_list_show_search_button'] = array(
    'title' => t('Show the search datasets button in the dataset list page'),
    'description' => t('If selected the search datasets button will be displayed in the dataset list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
}
