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

<nav id="scroll-menu" data-spy="affix">
  <ul class="nav">
    <li>
      <a href="#overview">
        <?php print t('Study Detail'); ?>
      </a>
      <ul class="nav" style="display: block;">
        <li>
          <a href="#overview">
            <?php print t('Overview / Design'); ?>
          </a>
        </li>
        <li>
          <a href="#access">
            <?php if ($marker_paper && $pubmed_id): ?>
              <?php print t('Access / Marker Paper'); ?>
            <?php elseif ($marker_paper): ?>
              <?php print $localize->getTranslation('study.marker-paper'); ?>
            <?php else: ?>
              <?php print $localize->getTranslation('study.access.label'); ?>
            <?php endif; ?>
          </a>
        </li>
        <?php if ($info): ?>
          <li>
            <a href="#info"><?php print $localize->getTranslation('suppl-info'); ?>
            </a>
          </li>
        <?php endif; ?>
        <?php if ($attachments): ?>
          <li>
            <a href="#documents">
              <?php print variable_get_value('files_documents_label'); ?>
            </a>
          </li>
        <?php endif; ?>
        <li>
          <a href="#timeline">
            <?php print $localize->getTranslation('study.timeline'); ?>
          </a>
        </li>
        <li>
          <a href="#populations">
            <?php print $localize->getTranslation('study.populations'); ?>
          </a>
        </li>
        <?php if (!empty($networks)): ?>
          <li>
            <a href="#networks">
              <?php print $localize->getTranslation('networks'); ?>
            </a>
          </li>
        <?php endif; ?>
        <?php if (!empty($datasets)): ?>
          <li>
            <a href="#datasets">
              <?php print $localize->getTranslation('datasets'); ?>
            </a>
          </li>
        <?php endif; ?>
        <?php if (!empty($datasets) && !empty($study_variables_aggs)): ?>
          <li>
            <a href="#variables">
              <?php print $localize->getTranslation('variables'); ?>
            </a>
          </li>
        <?php endif; ?>
        <?php if (!empty($coverage)): ?>
          <li>
            <a href="#coverage">
              <?php print $localize->getTranslation('variable-classifications'); ?>
            </a>
          </li>
        <?php endif; ?>
      </ul>
    </li>

</nav>
