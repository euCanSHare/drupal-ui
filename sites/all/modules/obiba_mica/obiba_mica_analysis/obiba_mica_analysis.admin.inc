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
 * Obiba Mica Analysis module variable file
 */

/**
 * Provides settings pages.
 */
function obiba_mica_analysis_admin_settings() {
  $form['obiba_mica_analysis'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Analysis display settings'),
    '#collapsible' => FALSE,
  );

  $form['obiba_mica_analysis']['analysis_display'] = array(
    '#type' => 'fieldset',
    '#title' => t('Analysis display'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('entities_count_page_title');
  $form['obiba_mica_analysis']['analysis_display']['entities_count_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('entities_count_page_title'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  return system_settings_form($form);
}
