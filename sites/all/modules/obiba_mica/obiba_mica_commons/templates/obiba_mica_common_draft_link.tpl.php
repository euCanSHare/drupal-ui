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
?>

<div class="draft navbar-fixed-bottom" style="z-index:100;">
  <div  class="panel-warning bg-warning text-center">
    <div class="panel-heading bg-warning">
      <h4 class="panel-title"><?php print t('You are viewing a draft version.') ?>
        <?php if (!empty($published)): ?>
          <?php print t('See also') ?>
          <a href="<?php print url('mica/' . $document_path . '/' . $document_id) ?>" style="font-weight: bolder;">
            <?php print t('the published version.') ?>
          </a>
        <?php endif; ?>
      </h4>
    </div>
  </div>
</div>
