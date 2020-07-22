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
 * Count the entities matching the RQL query.
 */
function obiba_mica_analysis_entities_count_query($query = NULL) {
  $resource = new ObibaAnalysisResources();
  $q = $query;
  if (empty($q) && !empty($_POST['query'])) {
    $q = $_POST['query'];
  }
  $result = $resource->entitiesCountQuery($q);
  drupal_json_output($result);
}
