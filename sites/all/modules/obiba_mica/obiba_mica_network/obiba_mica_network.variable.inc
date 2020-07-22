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
 * Obiba Mica variable file
 */

/**
 * Implements hook_variable_info().
 */
function obiba_mica_network_variable_info($options) {
  _obiba_mica_network_content($variable);
  return $variable;
}

/**
 * Setting Variable content page study.
 */
function _obiba_mica_network_content(&$variable) {
  $variable['obiba_mica_network_studies_table_show_variable'] = array(
    'title' => t('Show the variables column in the studies table'),
    'description' => t('If selected the variables column will be shown in the studies table'),
    'type' => 'boolean',
    'default' => FALSE,
  );

  $variable['obiba_mica_network_show_classifications'] = array(
    'title' => t('Show the classification graphics'),
    'description' => t('If selected the variable classification graphics will be displayed'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['obiba_mica_network_studies_variable_classifications'] = array(
    'title' => t('Show the studies/variables classification graphics'),
    'description' => t('Select the studies/variables classification graphics that will be displayed'),
    'type' => 'string',
    'default' => "0",
  );

}
