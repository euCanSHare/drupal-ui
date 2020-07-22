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
 * Research project resource class
 */

function obiba_mica_research_project_drush_command() {
  $items['project-reset-to-default-menu'] = array(
    'callback' => 'obiba_mica_research_project_reset_menu',
    'aliases' => array('prtdm'),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUSH,
    'description' => dt('Reset to default research projects menu.'),
  );
  return $items;
}

/**
 * Reset Obiba MIca Project Drupal customized menu to default
 *
 */
function obiba_mica_research_project_reset_menu(){
    $num_menu_link_deleted = db_delete('menu_links')
      ->condition('link_path', db_like('mica/research') . '%', 'LIKE')
      ->execute();

    $num_menu_router_deleted = db_delete('menu_router')
      ->condition('path', db_like('mica/research') . '%', 'LIKE')
      ->execute();

  drush_log(dt('Research Project menu reset to default : @menu_link Menu link deleted, @menu_router Menu router deleted', array(
      '@menu_link' => $num_menu_link_deleted,
      '@menu_router' =>  $num_menu_router_deleted
    )), 'warning');

}