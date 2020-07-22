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
 * Hooks provided by Obiba Mica app angular module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Load the menu paths on each module implementing angular app.
 *
 * @return array
 *   The array of menu as defined by Drupal menu system.
 */
function hook_load_menus() {
  $items = array();

  $items['given/path'] = array(
    'access callback' => TRUE,
    'title' => t('Title menu'),
  );
  return $items;
}

/**
 * Load angular application javascript within the module.
 */
function hook_get_js($weight_js) {
  if (current_path() == ObibaAnalysisResources::CROSSTAB) {
    $module_path = drupal_get_path('module', 'obiba_mica_analysis');
    $js = file_scan_directory($module_path . '/js/app', '/.*\.js$/', array('key' => 'name'));
    ksort($js);
    foreach ($js as $file_js) {
      drupal_add_js($file_js->uri, array(
        'type' => 'file',
        'scope' => 'footer',
        'weight' => ++$weight_js,
      ));
    }
  }
  return ++$weight_js;
}

/**
 * The Angular application name to load on the main app.
 *
 * @return string
 *   The module angular name.
 */
function hook_get_ng_module_to_load() {
  if (module_exists("obiba_mica_analysis") && current_path() == ObibaAnalysisResources::CROSSTAB) {
    return 'mica.AnalysisVariableCrosstab';
  }
  return FALSE;
}

/**
 * @} End of "addtogroup hooks".
 */
