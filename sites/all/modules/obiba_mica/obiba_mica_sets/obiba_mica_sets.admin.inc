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
function obiba_mica_sets_admin_settings() {
  $form['obiba_mica_sets'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Sets display settings'),
    '#collapsible' => FALSE,
  );

  $form['obiba_mica_sets']['sets_display'] = array(
    '#type' => 'fieldset',
    '#title' => t('Sets display'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('help_text_cart_page');
  $form['obiba_mica_sets']['sets_display']['help_text_cart_page'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('help_text_cart_page'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );
  $info = variable_get_info('help_text_sets_page');
  $form['obiba_mica_sets']['sets_display']['help_text_sets_page'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#required' => FALSE,
    '#default_value' => variable_get_value('help_text_sets_page'),
    '#maxlength' => 255,
    '#description' => $info['description'],
  );

  return system_settings_form($form);
}
