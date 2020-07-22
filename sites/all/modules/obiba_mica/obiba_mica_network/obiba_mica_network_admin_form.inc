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
 * Provides settings pages form.
 *
 * @return array
 *   The setting form on a array drupal markup.
 */

/**
* Study content form setting.
*
* @param array $form
*   The admin setting form.
*/
function obiba_mica_network_settings_admin_content(&$form) {
_obiba_mica_network_settings_admin_network_content($form);
}

function _obiba_mica_network_settings_admin_network_content(&$form){
  $form['content_display_settings']['network_form'] = array(
    '#weight' => 4,
    '#type' => 'fieldset',
    '#title' => t('Network Content'),
    '#collapsible' => FALSE,
  );

  $form['content_display_settings']['network_form']['network_details'] = array(
    '#type' => 'fieldset',
    '#title' => t('Network details page'),
    '#collapsible' => FALSE,
  );



  $info = variable_get_info('obiba_mica_network_studies_table_show_variable');
  $form['content_display_settings']['network_form']['network_details']['obiba_mica_network_studies_table_show_variable'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('obiba_mica_network_studies_table_show_variable'),
    '#description' => $info['description'],
  );

  $form['content_display_settings']['network_form']['network_coverage'] = array(
    '#type' => 'fieldset',
    '#title' => t('Network graphics coverage settings'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('obiba_mica_network_show_classifications');
  $form['content_display_settings']['network_form']['network_coverage']['obiba_mica_network_show_classifications'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('obiba_mica_network_show_classifications'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('obiba_mica_network_studies_variable_classifications');
  $form['content_display_settings']['network_form']['network_coverage']['obiba_mica_network_studies_variable_classifications'] = array(
    '#type' => 'radios',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('obiba_mica_network_studies_variable_classifications'),
    '#options' => array(
      "0" => t('Variables classification graphics'),
      "1" => t('Studies classification graphics'),
    ),
    '#description' => $info['description'],
  );

}
