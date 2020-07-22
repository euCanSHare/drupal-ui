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
function obiba_mica_content_pages_admin_settings() {
  $form['content_display_settings'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Content page display settings'),
    '#collapsible' => FALSE,
  );
  obiba_mica_settings_network_content($form);

  if (module_exists('obiba_mica_data_access_request')) {
    obiba_mica_settings_data_access_content($form);
  }

  $form['translation'] = array(
    '#type' => 'fieldset',
    '#title' => t('Translations'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('mica_disabled_path_translation');
  $form['translation']['mica_disabled_path_translation'] = array(
    '#type' => 'textarea',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('mica_disabled_path_translation'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $form['configs'] = array(
    '#type' => 'fieldset',
    '#title' => t('Global Configurations'),
    '#collapsible' => FALSE,
  );
  $info = variable_get_info('obiba_mica_enable_scroll_up');
  $form['configs']['obiba_mica_enable_scroll_up'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('obiba_mica_enable_scroll_up'),
    '#description' => $info['description'],
  );

  return system_settings_form($form);
}

/**
 * Data access content form setting.
 *
 * @param array $form
 *   The admin setting form.
 */
function obiba_mica_settings_data_access_content(&$form) {
  $form['content_display_settings']['access_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Data Access Content'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('access_home_page_title');
  $form['content_display_settings']['access_form']['access_home_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_home_page_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('access_requests_page_title');
  $form['content_display_settings']['access_form']['my_requests']['access_requests_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_requests_page_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $info = variable_get_info('access_request_my_page_title');
  $form['content_display_settings']['access_form']['my_requests']['access_request_my_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_request_my_page_title'),
    "#maxlength" => 255,
    "#description" => $info['description']
  );

  $info = variable_get_info('access_request_page_title');
  $form['content_display_settings']['access_form']['my_requests']['access_request_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_request_page_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('access_documents_section_title');
  $form['content_display_settings']['access_form']['my_requests']['access_documents_section_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_documents_section_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  $info = variable_get_info('access_documents_section_help_text');
  $form['content_display_settings']['access_form']['my_requests']['access_documents_section_help_text'] = array(
    '#type' => 'textarea',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_documents_section_help_text'),
    '#description' => $info['description'],
  );
  $info = variable_get_info('user_list_page_title');
  $form['content_display_settings']['access_form']['user_list_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('user_list_page_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('access_my_requests_button');
  $form['content_display_settings']['access_form']['access_my_requests_button'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_my_requests_button'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('access_download_button');
  $form['content_display_settings']['access_form']['access_download_button'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_download_button'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('access_new_request_button');
  $form['content_display_settings']['access_form']['access_new_request_button'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_new_request_button'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('access_new_request_button_info');
  $form['content_display_settings']['access_form']['access_new_request_button_info'] = array(
    '#type' => 'textarea',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_new_request_button_info'),
    '#maxlength' => 255,
    '#description' => $info['description']
  );
  $info = variable_get_info('access_comments_enabled');
  $form['content_display_settings']['access_form']['access_comments_enabled'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('access_comments_enabled'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
}

/**
 * Network content form setting.
 *
 * @param array $form
 *   The admin setting form.
 */
function obiba_mica_settings_network_content(&$form) {
  // no settings
}
