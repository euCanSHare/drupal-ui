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

<?php foreach ($variable_harmonization_algorithms as $key_var_harmo => $variable_harmonization_algorithm) : ?>
  <h4><?php print l($key_var_harmo, 'mica/variable/' . $variable_harmonization_algorithm['var_id'], array(
      'query' => array(
        'title' => $key_var_harmo,
      ),
    )); ?></h4>

  <div class="row">
    <div class="col-md-6 col-sm-12">
      <?php print !empty($variable_harmonization_algorithm['var_detail']) ? $variable_harmonization_algorithm['var_detail'] : NULL ?>
    </div>
  </div>
<?php endforeach; ?>
