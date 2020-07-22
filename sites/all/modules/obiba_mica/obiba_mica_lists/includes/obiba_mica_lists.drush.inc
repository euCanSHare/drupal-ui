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
 * drush commands  To add some basic node to describe lists page
 */
/**
 * Implements hook_drush_command().
 */
function obiba_mica_lists_drush_command() {
  $items['create-lists-pages'] = array(
    'callback' => 'obiba_mica_lists_drush_create_lists_page',
    'aliases' => array('olclp'),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUSH,
    'description' => dt('Create some nodes to describe lists pages'),
  );

  return $items;
}

/**
 * Uses curl to install all required JS packages. No other dependencies than
 * Curl is required.
 */
function obiba_mica_lists_drush_create_lists_page(){
  drupal_load('module', 'obiba_mica_commons');
  drupal_load('module', 'obiba_mica_lists');
  drush_log(dt("Create nodes to lists pages"), 'success');
  $pages = obiba_mica_lists_content_to_create();
  foreach ($pages as $varibale_node => $node_content) {
    node_delete(variable_get($varibale_node));
    $study_node_page = obiba_mica_commons_add_page($node_content['title'], $node_content['content']);
    variable_set($varibale_node, $study_node_page->nid);
  }
  drush_log(dt("End Create nodes to lists pages"), 'success');
}
