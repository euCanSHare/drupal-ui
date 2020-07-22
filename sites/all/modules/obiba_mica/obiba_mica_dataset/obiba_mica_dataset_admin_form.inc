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

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;

function obiba_mica_dataset_admin_settings(&$form){
  _obiba_mica_dataset_settings_dataset_content($form);
  _obiba_mica_dataset_settings_variable_content($form);
}

/**
 * Variable content form setting.
 *
 * @param array $form
 *   The admin setting form.
 */
function _obiba_mica_dataset_settings_dataset_content(&$form) {
  $form['content_display_settings']['dataset_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Dataset Content'),
    '#collapsible' => FALSE,
  );
  $form['content_display_settings']['dataset_form']['dataset_details'] = array(
    '#type' => 'fieldset',
    '#title' => t('Dataset details page'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('dataset_detailed_crosstab');
  $form['content_display_settings']['dataset_form']['dataset_details']['dataset_detailed_crosstab'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_detailed_crosstab'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('dataset_title_acronym_setup');
  $form['content_display_settings']['dataset_form']['dataset_details']['dataset_title_acronym_setup'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_title_acronym_setup'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('dataset_show_harmonization_studies');
  $form['content_display_settings']['dataset_form']['dataset_details']['dataset_show_harmonization_studies'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_show_harmonization_studies'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('dataset_show_collected_studies');
  $form['content_display_settings']['dataset_form']['dataset_details']['dataset_show_collected_studies'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_show_collected_studies'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('dataset_description_overview_field');
  $form['content_display_settings']['dataset_form']['dataset_details']['dataset_description_overview_field'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_description_overview_field'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('obiba_mica_dataset_studies_table_show_variable');
  $form['content_display_settings']['dataset_form']['dataset_details']['obiba_mica_dataset_studies_table_show_variable'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('obiba_mica_dataset_studies_table_show_variable'),
    '#description' => $info['description'],
  );
    _obiba_mica_dataset_settings_harmonization_status($form);
}

/**
 * Harmonisation status table
 */
function _obiba_mica_dataset_settings_harmonization_status(&$form){
    $form['content_display_settings']['dataset_form']['harmonization_status_settings']['obiba_mica_dataset_harmonization_status'] = array(
        '#type' => 'fieldset',
        '#title' => t('Harmonizations status table settings'),
        '#description' => t('Manage different variable harmonization status'),
        '#collapsible' => FALSE,
    );


    $harmonization_status_terms = _obiba_mica_dataset_get_harmonization_status('');
    if (!empty($harmonization_status_terms)) {
        // Draggable form widget
        $info = variable_get_info('obiba_mica_dataset_harmonization_status');
        $form_mica_harmonization_status_order = array(
            '#prefix' => _obiba_mica_dataset_harmonization_status_title_description_draggable_field($info['title'], $info['description']),
            '#tree' => TRUE,
            '#theme' => 'obiba_mica_dataset_harmonization_status_drag_components',
            '#title' => $info['title'],
            '#required' => FALSE,
            '#description' => $info['description'],
        );
        $wrapped_harmonization_status_draggable_form = _obiba_mica_dataset_get_harmonization_status_draggable_form($form_mica_harmonization_status_order, $harmonization_status_terms, 'obiba_mica_dataset_harmonization_status');
        $form['content_display_settings']['dataset_form']['harmonization_status_settings']['obiba_mica_dataset_harmonization_status'] = array_merge($form_mica_harmonization_status_order, $wrapped_harmonization_status_draggable_form);
        $form['content_display_settings']['dataset_form']['harmonization_status_settings']['harmonization_status_settings_action_submit'] = array(
            '#type' => 'submit',
            '#value' => t('Save Harmonization Status settings'),
            '#current_value' => 'obiba_mica_dataset_harmonization_status',
            '#submit' => array('_obiba_mica_dataset_settings_save_harmonization_status_order'),
        );
    }
}

/**
 * Draggable widget form implementation.
 *
 * @param $draggable_form
 * @param $draggable_items
 * @param $variable_key
 * @return mixed
 */
function _obiba_mica_dataset_get_harmonization_status_draggable_form($draggable_form, $draggable_items, $variable_key) {
    $default_value = variable_get_value($variable_key);
    foreach ($draggable_items as $key_harmonization_status => $harmonization_status) {
            $draggable_form[$harmonization_status->name] =
                array(
                    'value' => array(
                        '#type' => 'hidden',
                        '#title_display' => 'invisible',
                        '#default_value' => $harmonization_status->name,
                    ),
                    'title' => array(
                        '#type' => 'textfield',
                        '#value' => !empty($default_value[$harmonization_status->name]['title']) ? $default_value[$harmonization_status->name]['title'] : check_plain(obiba_mica_commons_get_localized_field($harmonization_status, 'title')),
                        '#markup' => check_plain(obiba_mica_commons_get_localized_field($harmonization_status, 'title')),
                        '#title_display' => 'invisible',
                    ),
                    'description' => array(
                        '#type' => 'textfield',
                        '#value' => !empty($default_value[$harmonization_status->name]['description']) ? filter_xss($default_value[$harmonization_status->name]['description'], obiba_mica_commons_allowed_filter_xss_tags()) : check_plain(obiba_mica_commons_get_localized_field($harmonization_status, 'description')),
                        '#title_display' => 'invisible',
                        '#maxlength' => 1024,
                    ),
                    'icon' => array(
                        '#type' => 'textfield',
                        '#value' => !empty($default_value[$harmonization_status->name]['icon']) ? filter_xss($default_value[$harmonization_status->name]['icon'], obiba_mica_commons_allowed_filter_xss_tags()) : '',
                        '#title_display' => 'invisible',
                    ),
                    'weight' => array(
                        '#type' => 'weight',
                        '#default_value' => !empty($default_value[$harmonization_status->name]) ? $default_value[$harmonization_status->name]['weight'] : 0,
                        '#title_display' => 'invisible',
                        '#attributes' => array('class' => array('dataset-harmonization-status-weight')),
                    ),
                );
        }
    uasort($draggable_form, '_obiba_mica_dataset_array_sort');
    return $draggable_form;
}

/**
 * Construct the title and description of a draggable table field
 *
 * @param $title
 * @param $description
 * @return string
 */
function _obiba_mica_dataset_harmonization_status_title_description_draggable_field($title, $description) {
    return <<<EOT
    <label class="control-label">$title</label>
    <div class="help-block">$description</div>
EOT;
}


/**
 * Resource to get the taxonomies from mica server.
 * @return object
 */
function _obiba_mica_dataset_get_harmonization_status($resource) {
    $get_vocabulary = function($taxonomies, $taxonomy, $vocabulary) {
        $harmo_taxo =  array_filter($taxonomies, function($taxo) use($taxonomy, $vocabulary){
            if ($taxo->name == $taxonomy ) {
                return array_filter($taxo->vocabularies, function($vocab) use ($vocabulary) {
                    return ($vocab->name == $vocabulary) ? $vocab->terms : FALSE;
                } );
            }
            return FALSE;
        });
        return array_filter(current($harmo_taxo)->vocabularies, function($vocab) use ($vocabulary){
            return ($vocab->name == $vocabulary) ? $vocab->terms : FALSE;
        });
    };
    $service = new DrupalMicaClient\DrupalMicaClientTaxonomyResource();
    $taxonomies = $service->getTaxonomySummaries($resource);
    if (!empty($taxonomies->summaries)) {
        return $taxonomies->summaries;
    }
    /*
    Get status from taxonomies
    */
    return current($get_vocabulary($taxonomies, 'Mlstr_harmo', 'status'))->terms;
}

function _obiba_mica_dataset_settings_save_harmonization_status_order(&$form, &$form_state) {
    _obiba_mica_dataset_settings_submit_harmonization_status_draggable($form, $form_state, 'obiba_mica_dataset_harmonization_status');
}

/**
 * Action when saving the enabled taxonomies order the default save of the
 * form can't save the status of this widget.
 *
 * @param $form
 * @param $form_state
 */
function _obiba_mica_dataset_settings_submit_harmonization_status_draggable(&$form, &$form_state, $variable) {
    $harmonization_status_form = $form_state['input'][$variable];
    uasort($harmonization_status_form, '_obiba_mica_dataset_sort_variable');
    variable_set($variable, $harmonization_status_form);
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
function _obiba_mica_dataset_sort_variable($a, $b) {
    if (isset($a['weight']) && isset($b['weight'])) {
        return $a['weight'] < $b['weight'] ? -1 : 1;
    }
    return 0;
}

/**
 * Custom array sort function by weight to display the taxonomies widget items
 * in correct order.
 *
 * @param $a
 * @param $b
 * @return int
 */
function _obiba_mica_dataset_array_sort($a, $b) {
    if (isset($a['weight']['#default_value']) && isset($b['weight']['#default_value'])) {
        return $a['weight']['#default_value'] < $b['weight']['#default_value'] ? -1 : 1;
    }
    return 0;
}

/**
 * Variable content form setting.
 *
 * @param array $form
 *   The admin setting form.
 */
function _obiba_mica_dataset_settings_variable_content(&$form) {
  $form['content_display_settings']['variable_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Variable Content'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('mica_all_variables_dataschema');
  $form['content_display_settings']['variable_form']['mica_all_variables_dataschema'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_all_variables_dataschema'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('mica_statistics');
  $form['content_display_settings']['variable_form']['mica_statistics'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_statistics'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('variable_show_studies');
  $form['content_display_settings']['variable_form']['variable_show_studies'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variable_show_studies'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('variable_show_networks');
  $form['content_display_settings']['variable_form']['variable_show_networks'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variable_show_networks'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('dataset_detailed_var_stats');
  $form['content_display_settings']['variable_form']['dataset_detailed_var_stats'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dataset_detailed_var_stats'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('variable_algorithm');
  $form['content_display_settings']['variable_form']['variable_algorithm'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('variable_algorithm'),
    '#description' => $info['description'],
  );
}

