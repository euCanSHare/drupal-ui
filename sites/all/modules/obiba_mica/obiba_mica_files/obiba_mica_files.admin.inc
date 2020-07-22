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
 * Obiba Mica files module admin settings
 */

/**
 * Provides settings pages.
 */
function obiba_mica_files_admin_settings() {

  $form['files'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Files module display settings'),
    '#collapsible' => FALSE,
  );

  $form['files']['files_display'] = array(
    '#type' => 'fieldset',
    '#title' => t('Files module display'),
    '#collapsible' => FALSE,
  );

  $form['files']['files_display']['labels'] = array(
    '#type' => 'fieldset',
    '#title' => t('Files module labels'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('files_documents_label');
  $form['files']['files_display']['labels']['files_documents_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('files_documents_label'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  return system_settings_form($form);

}
