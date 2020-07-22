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
 * Code for the obiba_mica_persons modules.
 */

?>

<div id="associated-people" class="modal fade"
  xmlns="http://www.w3.org/1999/html">
  <div class="modal-dialog  modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"
          aria-hidden="true">&times;</button>
        <h3
          class="modal-title"><?php print $localize->getTranslation('network.associated-people'); ?></h3>
      </div>
      <div class="modal-body">
        <?php if (!empty($persons_table)): ?>
          <?php print $persons_table; ?>
        <?php endif; ?>
      </div>
      <div class="clearfix"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default"
          data-dismiss="modal"><?php print $localize->getTranslation('close'); ?></button>
      </div>
    </div>
  </div>
</div>
