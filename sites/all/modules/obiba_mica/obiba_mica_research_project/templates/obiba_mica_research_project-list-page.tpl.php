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

print render($node_page); ?>

<div class="list-page">
  <div class="row">
    <?php
      $count = empty($total_items) ? 0 : $total_items;
      $caption = $count < 2 ? $localize->getTranslation('research-project.label') : $localize->getTranslation('research-projects');
    ?>
    <div class="col-xs-4 col-sm-2 min-height-align search-count">
      <?php if (variable_get_value('project_approved_list_show_count_caption')): ?>
      <span id="refresh-count"><?php print $count ?></span>
      <span id="refresh-count"><?php print $caption ?></span>
      <?php endif; ?>
    </div>
    
    <div class="col-xs-8 col-sm-10 min-height-align">
      <div class="hidden-xs inline">
        <?php print render($form_search); ?>
      </div>
    </div>
  </div>
  <p>&nbsp;</p>
  <div id="refresh-list">
    <?php 
    if (!empty($list_projects)) :
      print render($list_projects); 
    endif; 
    ?>      
  </div>
  <div class="clearfix"></div>
  <div><?php print $pager_wrap; ?></div>
</div>
