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

<h2 id="coverage"><?php print $localize->getTranslation('variable-classifications') ?></h2>
<?php foreach ($coverage as $taxonomy_coverage): ?>
  <h3><?php print obiba_mica_commons_get_localized_field($taxonomy_coverage['taxonomy'], 'titles'); ?></h3>

  <p class="help-block">
    <?php print obiba_mica_commons_get_localized_field($taxonomy_coverage['taxonomy'], 'descriptions'); ?>
  </p>

  <div class="scroll-content-tab">
    <?php print render($taxonomy_coverage['chart']); ?>
  </div>
<?php endforeach ?>
