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
 * Obiba Mica client module settings UI.
 */

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;

/**
 * Provides settings pages.
 */
function obiba_mica_search_pages_admin_settings() {
  $form['search_display_settings'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Search page display settings'),
    '#collapsible' => FALSE,
  );

  _obiba_mica_settings_search($form, $form_state);
  _obiba_mica_settings_search_networks_form($form);
  _obiba_mica_settings_search_studies_form($form);
  _obiba_mica_settings_search_datasets_form($form);
  _obiba_mica_settings_search_variables_form($form);

  return system_settings_form($form);
}

/**
 * settings of search page
 * @param $form
 */
function _obiba_mica_settings_search(&$form, &$form_state) {
  $add_form_field = function (&$form, $field_name, $info = NULL, $type = 'textfield', $maxlength = 255) {
    $info = empty($info) ? variable_get_info($field_name) : $info;
    $form[$field_name] = array(
      '#type' => $type,
      '#title' => $info['title'],
      '#required' => FALSE,
      '#default_value' => variable_get_value($field_name),
      '#maxlength' => $maxlength,
      '#description' => $info['description'],
      '#attributes' => empty($info['placeholder']) ? array() : array('placeholder' => $info['placeholder'])
    );
  };

  $form['search_display_settings']['page_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Search Settings'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('search_page_title');
  $form['search_display_settings']['page_settings']['search_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('search_page_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
    '#attributes' => array('placeholder' => 'query=study(exists(Mica_study.id))&type=studies')
  );

  $info = variable_get_info('default_query_search');
  $form['search_display_settings']['page_settings']['default_query_search'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('default_query_search'),
    '#maxlength' => 255,
    '#description' => $info['description'],
    '#attributes' => array('placeholder' => 'query=study(exists(Mica_study.id))&type=studies')
  );

  $info = variable_get_info('help_text_search_page');
  $form['search_display_settings']['page_settings']['help_text_search_page'] = array(
    '#type' => 'textarea',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('help_text_search_page'),
    '#maxlength' => 4096,
    '#description' => $info['description'],
  );

  $info = variable_get_info('help_text_harmonization_potential_page');
  $form['search_display_settings']['page_settings']['help_text_harmonization_potential_page'] = array(
    '#type' => 'textarea',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('help_text_harmonization_potential_page'),
    '#maxlength' => 4096,
    '#description' => $info['description'],
  );

  $info = variable_get_info('help_link_label');
  $form['search_display_settings']['page_settings']['help_link_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('help_link_label'),
    '#maxlength' => 512,
    '#description' => $info['description'],
  );
  $info = variable_get_info('help_link_url');
  $form['search_display_settings']['page_settings']['help_link_url'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('help_link_url'),
    '#maxlength' => 512,
    '#description' => $info['description'],
  );

  $form['search_display_settings']['page_settings']['search_region_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Search region'),
    '#description' => t('Configure how to display the results (applies to any search queries).'),
    '#collapsible' => FALSE,
  );
  $add_form_field($form['search_display_settings']['page_settings']['search_region_settings'], 'mica_show_search_box', NULL, 'checkbox');
  $add_form_field($form['search_display_settings']['page_settings']['search_region_settings'], 'mica_show_search_browser', NULL, 'checkbox');
  $add_form_field($form['search_display_settings']['page_settings']['search_region_settings'], 'mica_search_show_copy_query', NULL, 'checkbox');
  $add_form_field($form['search_display_settings']['page_settings']['search_region_settings'], 'mica_target_tabs_order');

  $form['search_display_settings']['page_settings']['facet_region_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Facets region'),
    '#description' => t('Taxonomies can be shown as facets on the left in the search page.'),
    '#collapsible' => FALSE,
  );

  $taxonomies_items = _obiba_mica_admin_taxonomies_items('_filter');
  if (!empty($taxonomies_items)) {
    // Draggable form widget
    $info = variable_get_info('mica_variable_taxonomies_order');
    $form_mica_variable_taxonomies_order = array(
      '#prefix' => _obiba_mica_admin_search_title_description_draggable_field($info['title'], $info['description']),
      '#tree' => TRUE,
      '#theme' => 'obiba_mica_drag_components',
      '#title' => $info['title'],
      '#required' => FALSE,
      '#description' => $info['description'],
    );
    $wrapped_variable_taxonomies_draggable_form = _obiba_mica_admin_get_draggable_form($form_mica_variable_taxonomies_order, $taxonomies_items, 'mica_variable_taxonomies_order');
    $form['search_display_settings']['page_settings']['facet_region_settings']['mica_variable_taxonomies_order'] = array_merge($form_mica_variable_taxonomies_order, $wrapped_variable_taxonomies_draggable_form);
    $form['search_display_settings']['page_settings']['facet_region_settings']['facet_region_settings_action_submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save facets changes'),
      '#current_value' => 'mica_variable_taxonomies_order',
      '#submit' => array('_obiba_mica_settings_search_save_facets_order'),
    );
  }

  $form['search_display_settings']['page_settings']['facet_region_settings']['taxonomy_panel_fields_to_filter'] = array(
    '#type' => 'fieldset',
    '#title' => t('Fields used for filtering in the vocabularies and terms panel'),
    '#description' => t('List of fields that will be used to filter terms in the vocabularies and terms panel. By default, the field used is the terms\' title. The following fields can be added.'),
    '#collapsible' => FALSE,
  );

  $add_form_field($form['search_display_settings']['page_settings']['facet_region_settings']['taxonomy_panel_fields_to_filter'],
    'taxonomy_panel_fields_to_filter_description', NULL, 'checkbox');
  $add_form_field($form['search_display_settings']['page_settings']['facet_region_settings']['taxonomy_panel_fields_to_filter'],
      'taxonomy_panel_fields_to_filter_keywords', NULL, 'checkbox');

  $add_form_field($form['search_display_settings']['page_settings']['facet_region_settings'], 'mica_dataset_taxonomy_facet', NULL, 'checkbox');
  $add_form_field($form['search_display_settings']['page_settings']['facet_region_settings'], 'mica_study_taxonomy_facet', NULL, 'checkbox');
  $add_form_field($form['search_display_settings']['page_settings']['facet_region_settings'], 'mica_network_taxonomy_facet', NULL, 'checkbox');

  $form['search_display_settings']['page_settings']['facet_region_settings']['taxonomy_panel_fields_to_filter']['taxonomy_panel_fields_to_filter_title']['#default_value'] = TRUE;
  $form['search_display_settings']['page_settings']['facet_region_settings']['taxonomy_panel_fields_to_filter']['taxonomy_panel_fields_to_filter_title']['#disabled'] = TRUE;
  $form['search_display_settings']['page_settings']['result_region_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Results region'),
    '#description' => t('Configure how to display the results (applies to any search queries).'),
    '#collapsible' => FALSE,
  );
  $add_form_field($form['search_display_settings']['page_settings']['result_region_settings'], 'mica_search_tabs_order');
  $add_form_field($form['search_display_settings']['page_settings']['result_region_settings'], 'mica_result_tabs_order');

  $coverage_group_by_options = obiba_mica_coverage_group_by_options();
  $info = variable_get_info('coverage_group_by');
  $form['search_display_settings']['page_settings']['result_region_settings']['coverage_group_by'] = array(
    '#type' => 'checkboxes',
    '#multiple' => TRUE,
    '#default_value' => variable_get_value('coverage_group_by'),
    '#title' => $info['title'],
    '#options' => $coverage_group_by_options,
    '#description' => $info['description'],
  );

  $form['search_display_settings']['page_settings']['other_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Other search usage'),
    '#description' => t('Configure the integration of search in other pages.'),
    '#collapsible' => FALSE
  );

  $info = variable_get_info('network_list_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['network_list_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('network_list_show_search_button'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('network_detail_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['network_detail_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('network_detail_show_search_button'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('study_list_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['study_list_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('study_list_show_search_button'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('study_detail_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['study_detail_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('study_detail_show_search_button'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('harmo_study_detail_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['harmo_study_detail_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('harmo_study_detail_show_search_button'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('dataset_list_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['dataset_list_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_list_show_search_button'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('dataset_detail_show_search_button');
  $form['search_display_settings']['page_settings']['other_settings']['dataset_detail_show_search_button'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_detail_show_search_button'),
    '#description' => $info['description'],
  );

  if (!empty($taxonomies_items)) {
    // Draggable form widget
    $info = variable_get_info('mica_taxonomy_figures');
    $form_mica_taxonomy_figures = array(
      '#prefix' => _obiba_mica_admin_search_title_description_draggable_field($info['title'], $info['description']),
      '#tree' => TRUE,
      '#theme' => 'obiba_mica_drag_components',
      '#title' => $info['title'],
      '#required' => FALSE,
      '#description' => $info['description'],
    );
    $taxonomies_items = _obiba_mica_admin_search_filter_taxonomies_by_item($taxonomies_items, 'Mica_variable');
    $wrapped_taxonomies_draggable_form = _obiba_mica_admin_get_draggable_form($form_mica_taxonomy_figures, $taxonomies_items, 'mica_taxonomy_figures');
    $form['search_display_settings']['page_settings']['other_settings']['mica_taxonomy_figures'] = array_merge($form_mica_taxonomy_figures, $wrapped_taxonomies_draggable_form);
    $form['search_display_settings']['page_settings']['other_settings']['other_settings_action_submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save figures changes'),
      '#current_value' => 'mica_taxonomy_figures',
      '#submit' => array('_obiba_mica_settings_search_save_figures_order'),
    );
  }
}

/**
 * Remove item from array of taxonomies>.
 *
 * @param $taxonomies_items
 * @param $item
 * @return array
 */
function _obiba_mica_admin_search_filter_taxonomies_by_item($taxonomies_items, $item) {
  return array_filter(array_map(function ($taxonomy) use ($item) {
    if ($taxonomy->name === $item) {
      unset($taxonomy);
    }
    if (!empty($taxonomy)) {
      return $taxonomy;
    }
  }, $taxonomies_items));

}


function _obiba_mica_settings_search_save_facets_order(&$form, &$form_state) {
  _obiba_mica_settings_search_submit_draggable($form, $form_state, 'mica_variable_taxonomies_order');
}

function _obiba_mica_settings_search_save_figures_order(&$form, &$form_state) {
  _obiba_mica_settings_search_submit_draggable($form, $form_state, 'mica_taxonomy_figures');
}

/**
 * Action when saving the enabled taxonomies order the default save of the
 * form can't save the status of this widget.
 *
 * @param $form
 * @param $form_state
 */
function _obiba_mica_settings_search_submit_draggable(&$form, &$form_state, $variable) {
  $taxonomy_form = $form_state['values'][$variable];
  foreach ($taxonomy_form as $area => $field){
    if(!empty($form_state['input'][$variable][$area]['graphic_title'])){
      $taxonomy_form[$area]['graphic_title'] = $form_state['input'][$variable][$area]['graphic_title'];
    }
  }
  uasort($taxonomy_form, '_obiba_mica_array_sort_variable');
  variable_set($variable, $taxonomy_form);
}

/**
 * Custom array sort function by weight to save the mica_taxonomy_figures array
 * items in correct order.
 *
 * taxonomies in the admin form.
 * @param $a
 * @param $b
 * @return int
 */
function _obiba_mica_array_sort_variable($a, $b) {
  if (isset($a['weight']) && isset($b['weight'])) {
    return $a['weight'] < $b['weight'] ? -1 : 1;
  }
  return 0;
}

function _obiba_mica_settings_search_networks_form(&$form) {
  $form['search_display_settings']['networks_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Networks Search'),
    '#collapsible' => FALSE,
  );

  // tab
  $info = variable_get_info('networks_list_page_size');
  $form['search_display_settings']['networks_form']['networks_list_page_size'] = array(
    '#type' => 'select',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_list_page_size'),
    '#description' => $info['description'],
    '#options' => $info['options'],
  );

  // columns
  $form['search_display_settings']['networks_form']['networks_column'] = array(
    '#type' => 'fieldset',
    '#title' => t('Network column display settings'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('networks_column_studies');
  $form['search_display_settings']['networks_form']['networks_column']['networks_column_studies'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_column_studies'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('networks_column_study_datasets');
  $form['search_display_settings']['networks_form']['networks_column']['networks_column_study_datasets'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_column_study_datasets'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('networks_column_harmonization_datasets');
  $form['search_display_settings']['networks_form']['networks_column']['networks_column_harmonization_datasets'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_column_harmonization_datasets'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('networks_column_variables');
  $form['search_display_settings']['networks_form']['networks_column']['networks_column_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_column_variables'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('networks_column_study_variables');
  $form['search_display_settings']['networks_form']['networks_column']['networks_column_study_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_column_study_variables'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('networks_column_dataschema_variables');
  $form['search_display_settings']['networks_form']['networks_column']['networks_column_dataschema_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_column_dataschema_variables'),
    '#description' => $info['description'],
  );

  // labels
  $info = variable_get_info('networks_search_label');
  $form['search_display_settings']['networks_form']['networks_search_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_search_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('networks_empty_label');
  $form['search_display_settings']['networks_form']['networks_empty_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('networks_empty_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
}

function _obiba_mica_settings_search_studies_form(&$form) {
  $form['search_display_settings']['studies_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Studies Search'),
    '#collapsible' => FALSE,
  );

  // tab
  $info = variable_get_info('studies_list_page_size');
  $form['search_display_settings']['studies_form']['studies_list_page_size'] = array(
    '#type' => 'select',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_page_size'),
    '#description' => $info['description'],
    '#options' => $info['options'],
  );

  $info = variable_get_info('studies_facet_search');
  $form['search_display_settings']['studies_form']['studies_facet_search'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_facet_search'),
    '#description' => $info['description'],
  );

  // columns
  $form['search_display_settings']['studies_form']['studies_column'] = array(
    '#type' => 'fieldset',
    '#title' => t('Study column display settings'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('studies_column_type');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_type'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_type'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_design');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_design'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_design'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_questionnaire');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_questionnaire'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_questionnaire'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_pm');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_pm'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_pm'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_bio');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_bio'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_bio'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_other');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_other'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_other'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_participants');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_participants'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_participants'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_networks');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_networks'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_networks'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_study_datasets');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_study_datasets'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_study_datasets'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_harmonization_datasets');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_harmonization_datasets'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_harmonization_datasets'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_variables');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_variables'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_study_variables');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_study_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_study_variables'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('studies_column_dataschema_variables');
  $form['search_display_settings']['studies_form']['studies_column']['studies_column_dataschema_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_column_dataschema_variables'),
    '#description' => $info['description'],
  );


  // labels
  $info = variable_get_info('studies_search_label');
  $form['search_display_settings']['studies_form']['studies_search_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_search_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('search_studies_dce_autocomplete');
  $form['search_display_settings']['studies_form']['search_studies_dce_autocomplete'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('search_studies_dce_autocomplete'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('search_general_population_sources_autocomplete');
  $form['search_display_settings']['studies_form']['search_general_population_sources_autocomplete'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('search_general_population_sources_autocomplete'),
    '#description' => $info['description'],
  );
}

function _obiba_mica_settings_search_datasets_form(&$form) {
  $form['search_display_settings']['datasets_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Datasets Search'),
    '#collapsible' => FALSE,
  );

  // tab
  $info = variable_get_info('datasets_list_page_size');
  $form['search_display_settings']['datasets_form']['datasets_list_page_size'] = array(
    '#type' => 'select',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_list_page_size'),
    '#description' => $info['description'],
    '#options' => $info['options'],
  );


  // columns
  $form['search_display_settings']['datasets_form']['datasets_column'] = array(
    '#type' => 'fieldset',
    '#title' => t('Dataset column display settings'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('datasets_column_acronym');
  $form['search_display_settings']['datasets_form']['datasets_column']['datasets_column_acronym'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_column_acronym'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('datasets_column_type');
  $form['search_display_settings']['datasets_form']['datasets_column']['datasets_column_type'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_column_type'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('datasets_column_networks');
  $form['search_display_settings']['datasets_form']['datasets_column']['datasets_column_networks'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_column_networks'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('datasets_column_studies');
  $form['search_display_settings']['datasets_form']['datasets_column']['datasets_column_studies'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_column_studies'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('datasets_column_variables');
  $form['search_display_settings']['datasets_form']['datasets_column']['datasets_column_variables'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_column_variables'),
    '#description' => $info['description'],
  );

  // labels
  $info = variable_get_info('datasets_search_label');
  $form['search_display_settings']['datasets_form']['datasets_search_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_search_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('datasets_empty_label');
  $form['search_display_settings']['datasets_form']['datasets_empty_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('datasets_empty_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('search_datasets_autocomplete');
  $form['search_display_settings']['datasets_form']['search_datasets_autocomplete'] = array(
    '#type' => 'select',
    '#options' => array(
      ObibaDatasetConstants::FACET_TYPE_HIDE => t('Hide'),
      ObibaDatasetConstants::FACET_TYPE_AUTOCOMPLETE => t('Autocomplete'),
      ObibaDatasetConstants::FACET_TYPE_CHECKBOX => t('Checkbox')
    ),
    '#title' => $info['title'],
    '#default_value' => variable_get_value('search_datasets_autocomplete'),
    '#description' => $info['description'],
  );
}

function _obiba_mica_settings_search_variables_form(&$form) {
  $form['search_display_settings']['variables_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Variables Search'),
    '#collapsible' => FALSE,
  );

  // tab
  $info = variable_get_info('variables_list_page_size');
  $form['search_display_settings']['variables_form']['variables_list_page_size'] = array(
    '#type' => 'select',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_list_page_size'),
    '#description' => $info['description'],
    '#options' => $info['options'],
  );

  // columns
  $form['search_display_settings']['variables_form']['variables_column'] = array(
    '#type' => 'fieldset',
    '#title' => t('Variables column display settings'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('variables_column_type');
  $form['search_display_settings']['variables_form']['variables_column']['variables_column_type'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_column_type'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('variables_column_study');
  $form['search_display_settings']['variables_form']['variables_column']['variables_column_study'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_column_study'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('variables_column_dataset');
  $form['search_display_settings']['variables_form']['variables_column']['variables_column_dataset'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_column_dataset'),
    '#description' => $info['description'],
  );

  // labels
  $info = variable_get_info('variable_coverage_label');
  $form['search_display_settings']['variables_form']['variable_coverage_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variable_coverage_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('variables_search_label');
  $form['search_display_settings']['variables_form']['variables_search_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_search_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('variables_empty_label');
  $form['search_display_settings']['variables_form']['variables_empty_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_empty_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('variables_strict_coverage');
  $form['search_display_settings']['variables_form']['variables_strict_coverage'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variables_strict_coverage'),
    '#description' => $info['description'],
  );
}

/**
 * Resource to get the taxonomies from mica server.
 * @return object
 */
function _obiba_mica_admin_taxonomies_items($resource) {
  $service = new DrupalMicaClient\DrupalMicaClientTaxonomyResource();
  $taxonomies = $service->getTaxonomySummaries($resource);
  if (!empty($taxonomies->summaries)) {
    return $taxonomies->summaries;
  }
  return $taxonomies;
}

/**
 * Draggable widget form implementation.
 *
 * @param $draggable_form
 * @param $draggable_items
 * @param $variable_key
 * @return mixed
 */
function _obiba_mica_admin_get_draggable_form($draggable_form, $draggable_items, $variable_key) {
  $i = 0;
  $default_value = variable_get_value($variable_key);
  foreach ($draggable_items as $key_taxonomy => $summary) {
    if($variable_key == 'mica_taxonomy_figures'){
      $draggable_form[$summary->name] =
        array(
          'value' => array(
            '#type' => 'hidden',
            '#title_display' => 'invisible',
            '#default_value' => $summary->name,
          ),
          'value_name' => array(
            '#markup' => $summary->name,
          ),
          'description' => array(
            '#markup' => check_plain(obiba_mica_commons_get_localized_field($summary, 'title')),
          ),
          'graphic_title' => array(
            '#type' => 'textfield',
            '#value' => !empty($default_value[$summary->name]['graphic_title']) ? $default_value[$summary->name]['graphic_title'] : check_plain(obiba_mica_commons_get_localized_field($summary, 'description')),
            '#markup' => check_plain(obiba_mica_commons_get_localized_field($summary, 'description')),
            '#title_display' => 'invisible',
          ),
          'weight' => array(
            '#type' => 'weight',
            '#default_value' => !empty($default_value[$summary->name]) ? $default_value[$summary->name]['weight'] : 0,
            '#title_display' => 'invisible',
            '#attributes' => array('class' => array('taxonomies-item-weight')),
          ),
          'enable' => array(
            '#type' => 'checkbox',
            '#default_value' => !empty($default_value[$summary->name]) ? $default_value[$summary->name]['enable'] : 0,
            '#title_display' => 'invisible',
          )
        );
    }
    else{
      $draggable_form[$summary->name] =
        array(
          'value' => array(
            '#type' => 'hidden',
            '#title_display' => 'invisible',
            '#default_value' => $summary->name,
          ),
          'value_name' => array(
            '#markup' => $summary->name,
          ),
          'description' => array(
            '#markup' => check_plain(obiba_mica_commons_get_localized_field($summary, 'title')),
          ),
          'weight' => array(
            '#type' => 'weight',
            '#default_value' => !empty($default_value[$summary->name]) ? $default_value[$summary->name]['weight'] : 0,
            '#title_display' => 'invisible',
            '#attributes' => array('class' => array('taxonomies-item-weight')),
          ),
          'enable' => array(
            '#type' => 'checkbox',
            '#default_value' => !empty($default_value[$summary->name]) ? $default_value[$summary->name]['enable'] : 0,
            '#title_display' => 'invisible',
          )
        );
    }
    $i++;
  }
  uasort($draggable_form, '_obiba_mica_array_sort');
  return $draggable_form;
}

// Custom array sort function by weight.

/**
 * Custom array sort function by weight to display the taxonomies widget items
 * in correct order.
 *
 * @param $a
 * @param $b
 * @return int
 */
function _obiba_mica_array_sort($a, $b) {
  if (isset($a['weight']['#default_value']) && isset($b['weight']['#default_value'])) {
    return $a['weight']['#default_value'] < $b['weight']['#default_value'] ? -1 : 1;
  }
  return 0;
}

/**
 * Grouped by coverage settings options
 */
function obiba_mica_coverage_group_by_options() {
  return array(
    'study' => t('Study'),
    'dce' => t('Data Collection Event'),
    'dataset' => t('Dataset')
  );
}
