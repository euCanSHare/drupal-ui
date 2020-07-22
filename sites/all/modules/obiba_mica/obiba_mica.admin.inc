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
function obiba_mica_admin_settings() {
  $form['server'] = array(
    '#type' => 'fieldset',
    '#title' => t('OBiBa study server (Mica)'),
    '#collapsible' => FALSE,
  );

  _obiba_mica_settings_server($form);

  $form['image_cache'] = array(
    '#type' => 'fieldset',
    '#title' => t('Cache images settings'),
    '#collapsible' => FALSE,
  );

  $form['image_cache']['clear_cache'] = array(
    '#type' => 'submit',
    '#value' => 'Clear images Cache',
    '#submit' => array('obiba_mica_clear_images_cache'),
    '#limit_validation_errors' => array(),
  );

  $form['#submit'] = array('obiba_mica_default_password');
  return system_settings_form($form);
}

/**
 * Server setting forms.
 */
function _obiba_mica_settings_server(&$form) {
  $info = variable_get_info('mica_url');
  $form['server']['mica_url'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => TRUE,
    '#default_value' => variable_get_value('mica_url'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $info = variable_get_info('mica_anonymous_name');
  $form['server']['mica_anonymous_name'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => TRUE,
    '#default_value' => variable_get_value('mica_anonymous_name'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $info = variable_get_info('mica_anonymous_password');
  $form['server']['mica_anonymous_password'] = array(
    '#type' => 'password',
    '#title' => $info['title'],
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $info = variable_get_info('mica_copyright_notice');
  $form['server']['mica_copyright_notice'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_copyright_notice'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $info = variable_get_info('mica_response_page_size');
  $form['server']['mica_response_page_size'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_response_page_size'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('mica_response_page_size');
  $form['server']['mica_response_page_size'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_response_page_size'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('mica_response_page_size_small');
  $form['server']['mica_response_page_size_small'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_response_page_size_small'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('mica_enable_to_mica_server_link');
  $form['server']['mica_enable_to_mica_server_link'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('mica_enable_to_mica_server_link'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('mica_allowed_xss_filtered_tag');
  $form['server']['mica_allowed_xss_filtered_tag'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#maxlength' => 500,
    '#default_value' => variable_get_value('mica_allowed_xss_filtered_tag'),
    '#description' => $info['description'],
    );
}

/**
 * Call Back on submit setting form option to set default password.
 */
function obiba_mica_default_password($form, &$form_state) {
  if (empty($form_state['values']['mica_anonymous_password'])) {
    $form_state['values']['mica_anonymous_password']
      = variable_get_value('mica_anonymous_password',
        array('default' => 'password'));
  }
}

/**
 * Call Back on clear images cache..
 */
function obiba_mica_clear_images_cache() {
  cache_clear_all(NULL, 'cache_image');
  drupal_set_message(t('The images cache cleared'));
}
