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
 * Obiba Mica Persons module variable file
 */

/**
 * Provides settings pages.
 */
function obiba_mica_persons_admin_settings() {
  $form['persons'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Persons display settings'),
    '#collapsible' => FALSE,
  );

  $form['persons']['persons_display'] = array(
    '#type' => 'fieldset',
    '#title' => t('Persons display'),
    '#collapsible' => FALSE,
  );

  $form['persons']['persons_display']['labels'] = array(
    '#type' => 'fieldset',
    '#title' => t('Persons labels'),
    '#collapsible' => FALSE,
  );

  return system_settings_form($form);
}
