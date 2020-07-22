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
 * Code for the obiba_mica_app_angular modules.
 */
?>

<?php if(!empty($node_page)):?>
<?php print render($node_page) ?>
<?php endif; ?>
  <obiba-alert id="MainController"></obiba-alert>
  <div class="alert-growl-container">
      <obiba-alert id="MainControllerGrowl"></obiba-alert>
  </div>
  <div ng-controller="NotificationController"></div>
  <div ng-view="" class=" <?php print !empty($module_caller) ? $module_caller : NULL; ?> "></div>
