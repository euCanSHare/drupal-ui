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

<h2><?php print $localize->getTranslation('datasets'); ?></h2>
<div id="datasetsDisplay" class="scroll-content-tab" data-dce-variables='<?php print !empty($datasets['dce_variables'])?json_encode($datasets['dce_variables']):''; ?>'
  data-total-variables='<?php print !empty($datasets['total_variable_nbr'])?json_encode($datasets['total_variable_nbr']):''; ?>'>
  <?php print render($datasets['dataset-tab']); ?>
</div>