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
 * Code for the obiba_mica_dataset modules.
 */

?>

<div class="legend lg-bottom-margin pull-left">
  <?php if (!empty($clickable)): ?>
    <p>
      <?php print t('Click on each status icon to get more details on the corresponding harmonization results') ?>
      :
    </p>
  <?php endif ?>
      <?php
      $harmonization_status = variable_get_value('obiba_mica_dataset_harmonization_status')
      ?>
      <?php foreach ($harmonization_status as $status_key => $status): ?>
  <div>
          <i class="<?php print filter_xss($status['icon'], obiba_mica_commons_allowed_filter_xss_tags()) ?>"></i>
          <h6><?php print $status['title'] ?></h6>
          <?php print ' - ' . filter_xss($status['description'], obiba_mica_commons_allowed_filter_xss_tags()) ?>
    </div>
      <?php endforeach ?>
</div>
