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

/**
 * Provides settings pages.
 */
function obiba_mica_lists_admin_settings() {
  $form['obiba_mica_lists'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('list Page'),
    '#collapsible' => FALSE,
  );
  _obiba_mica_lists_studies_admin($form);
  _obiba_mica_lists_networks_admin($form);
  _obiba_mica_lists_datasets_admin($form);
  return system_settings_form($form);
}

function _obiba_mica_lists_studies_admin(&$form){
  $localize = obiba_mica_commons_mica_server_localisation();
  $form['obiba_mica_lists']['obiba_mica_lists_studies'] = array(
    '#type' => 'fieldset',
    '#title' => t('Studies list Page'),
    '#collapsible' => FALSE,
  );
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria'] = array(
    '#type' => 'fieldset',
    '#title' => t('Studies list Page criteria'),
    '#collapsible' => FALSE,
  );

  $facets = variable_get_info('obiba_mica_lists_display_study_facets');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['obiba_mica_lists_display_study_facets'] = array(
    '#type' => 'checkbox',
    '#title' => $facets['title'],
    '#default_value' => variable_get_value('obiba_mica_lists_display_study_facets'),
    '#description' => $facets['description'],
  );
  $info = variable_get_info('studies_list_show_studies_count_caption');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_studies_count_caption'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_studies_count_caption'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('studies_list_show_search_form');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_search_form'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_search_form'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('studies_list_show_study_sup_info');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_study_sup_info'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_study_sup_info'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('studies_list_show_trimmed_description_study');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_trimmed_description_study'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_trimmed_description_study'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('studies_list_show_variables_count_badge');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_variables_count_badge'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_variables_count_badge'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('studies_list_show_datasets_count_badge');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_datasets_count_badge'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_datasets_count_badge'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('studies_list_show_networks_count_badge');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['studies_list_show_networks_count_badge'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('studies_list_show_networks_count_badge'),
    '#description' => $info['description'],
  );

  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['harmonization_study'] = array(
    '#type' => 'fieldset',
    '#title' => t('Harmonization specific options'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('harmo_studies_list_show_study_sup_info');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['harmonization_study']['harmo_studies_list_show_study_sup_info'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('harmo_studies_list_show_study_sup_info'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('harmo_studies_list_show_trimmed_description_study');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['harmonization_study']['harmo_studies_list_show_trimmed_description_study'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('harmo_studies_list_show_trimmed_description_study'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('harmo_studies_list_show_variables_count_badge');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['harmonization_study']['harmo_studies_list_show_variables_count_badge'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('harmo_studies_list_show_variables_count_badge'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('harmo_studies_list_show_datasets_count_badge');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['harmonization_study']['harmo_studies_list_show_datasets_count_badge'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('harmo_studies_list_show_datasets_count_badge'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('harmo_studies_list_show_networks_count_badge');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['harmonization_study']['harmo_studies_list_show_networks_count_badge'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('harmo_studies_list_show_networks_count_badge'),
    '#description' => $info['description'],
  );


  $info = variable_get_info('study_list_name_acronym_sort');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['study_list_name_acronym_sort'] = array(
    '#type' => 'radios',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('study_list_name_acronym_sort'),
    '#options' => array(
      '_score' => $localize->getTranslation('relevance'),
      'name' => t('Name'),
      'acronym' => t('Acronym'),
      'numberOfParticipants-participant-number' =>  $localize->getTranslation('study_taxonomy.vocabulary.numberOfParticipants-participant-number.title')
    ),
    '#description' => $info['description'],
  );

  $info = variable_get_info('study_list_default_order_sort');
  $form['obiba_mica_lists']['obiba_mica_lists_studies']['obiba_mica_lists_studies_criteria']['study_list_default_order_sort'] = array(
    '#type' => 'radios',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('study_list_default_order_sort'),
    '#options' => array(
      '' => t('Asc'),
      'desc' => t('Desc'),
    ),
    '#description' => $info['description'],
  );

}

function _obiba_mica_lists_networks_admin(&$form){
  $localize = obiba_mica_commons_mica_server_localisation();
  $form['obiba_mica_lists']['obiba_mica_lists_networks'] = array(
    '#type' => 'fieldset',
    '#title' => t('Networks list Page'),
    '#collapsible' => FALSE,
  );
  $form['obiba_mica_lists']['obiba_mica_lists_networks']['obiba_mica_lists_networks_criteria'] = array(
    '#type' => 'fieldset',
    '#title' => t('Networks list Page criteria'),
    '#collapsible' => FALSE,
  );
  $facets = variable_get_info('obiba_mica_lists_display_network_facets');
  $form['obiba_mica_lists']['obiba_mica_lists_networks']['obiba_mica_lists_networks_criteria']['obiba_mica_lists_display_network_facets'] = array(
    '#type' => 'checkbox',
    '#title' => $facets['title'],
    '#default_value' => variable_get_value('obiba_mica_lists_display_network_facets'),
    '#description' => $facets['description'],
  );

  $info = variable_get_info('network_list_default_field_sort');
  $form['obiba_mica_lists']['obiba_mica_lists_networks']['obiba_mica_lists_networks_criteria']['network_list_default_field_sort'] = array(
    '#type' => 'radios',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('network_list_default_field_sort'),
    '#options' => array(
      '_score' => $localize->getTranslation('relevance') ,
      'name' => t('Name'),
      'acronym' => t('Acronym'),
      'numberOfStudies' => $localize->getTranslation('studies')
    ),
    '#description' => $info['description'],
  );

  $info = variable_get_info('network_list_default_order_sort');
  $form['obiba_mica_lists']['obiba_mica_lists_networks']['obiba_mica_lists_networks_criteria']['network_list_default_order_sort'] = array(
    '#type' => 'radios',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('network_list_default_order_sort'),
    '#options' => array(
      '' => t('Asc'),
      'desc' => t('Desc'),
    ),
    '#description' => $info['description'],
  );

}

function _obiba_mica_lists_datasets_admin(&$form){
  $form['obiba_mica_lists']['obiba_mica_lists_datasets'] = array(
    '#type' => 'fieldset',
    '#title' => t('Datasets list Page'),
    '#collapsible' => FALSE,
  );
  $form['obiba_mica_lists']['obiba_mica_lists_datasets']['obiba_mica_lists_datasets_criteria'] = array(
    '#type' => 'fieldset',
    '#title' => t('Datasets list Page criteria'),
    '#collapsible' => FALSE,
  );
  $facets = variable_get_info('obiba_mica_lists_display_datset_facets');
  $form['obiba_mica_lists']['obiba_mica_lists_datasets']['obiba_mica_lists_datasets_criteria']['obiba_mica_lists_display_datset_facets'] = array(
    '#type' => 'checkbox',
    '#title' => $facets['title'],
    '#default_value' => variable_get_value('obiba_mica_lists_display_datset_facets'),
    '#description' => $facets['description'],
  );
}