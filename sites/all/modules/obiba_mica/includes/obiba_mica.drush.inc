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
 * drush commands  implementations to help users download required libraries.
 */

/**
 * Implements hook_drush_command().
 */
function obiba_mica_drush_command() {
  $items['download-mica-dependencies'] = array(
    'callback' => 'obiba_mica_drush_download_js_dependencies',
    'aliases' => array('dlmdeps'),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUSH,
    'description' => dt('Download Mica JavaScript dependencies for the production environment.'),
    'options' => array(
      'path' => dt('The path to the download folder. If omitted, Drush will use the default location (<code>sites/all/libraries</code>).'),
      'repo' => dt('The name of the Git repository.')
    ),
  );

  return $items;
}

/**
 * Uses curl to install all required JS packages. No other dependencies than
 * Curl is required.
 */
function obiba_mica_drush_download_js_dependencies(){

  $path = drush_get_option('path', drush_get_context('DRUSH_DRUPAL_ROOT')) . '/sites/all/libraries';
  $repository = drush_get_option('repo', '4.1.0');

  drush_log(dt(">> Download root path: $path"), 'success');
  drush_log(dt(">> Repository name: $repository"), 'success');

  // Create the libraries path if it does not exist.
  if (!is_dir($path)) {
    drush_op('mkdir', $path);
  }

  // clean up content
  if (!drush_shell_exec("rm -rf $path/*")) {
    drush_log(dt("Failed to empty $path content."), 'error');
    return;
  }

  $repository_name = 'mica-drupal-js-libraries';
  $dependencies_url = 'https://github.com/obiba/' . $repository_name . '/archive/' . $repository . '.tar.gz';

  if (!drush_shell_exec("rm -rf $path/*")) {
    drush_log(dt("Failed to empty $path content."), 'error');
    return;
  }

  if (!drush_shell_exec("curl -Ls $dependencies_url |  tar -xzf - -C $path/. --strip-components=1")) {
    drush_log(dt("Failed download to dependencies from $dependencies_url to $path."), 'error');
    return;
  }
  else {
    drush_log(dt("Dependencies downloaded from $dependencies_url to $path."), 'success');
  }

  if (!drush_shell_exec("rm -rf .git*")) {
    drush_log(dt("Failed to delete Git related file"), 'warning');
  }
}
