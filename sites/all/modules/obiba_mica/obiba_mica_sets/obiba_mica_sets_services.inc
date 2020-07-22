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

function obiba_mica_sets_list_sets($document_type = 'variables') {
  $resource = new ObibaSetsResources();
  $result = $resource->getSets($document_type);
  drupal_json_output($result);
}

/**
 * Create a set by importing (possibly empty) a list of identifiers.
 */
function obiba_mica_sets_import($document_type = 'variables') {
  $resource = new ObibaSetsResources();
  $body = file_get_contents('php://input');
  // Fix set name in query builder Bug if cache enabled #1680
  if(variable_get_value('cache') == 1){
    obiba_mica_commons_set_cache('do_request/taxonomies/_filter?target=variable', NULL);
  }
  $result = $resource->createSet($document_type, $body, !empty(drupal_get_query_parameters()['name']) ? drupal_get_query_parameters()['name']: NULL);
  drupal_json_output($result);
}

/**
 * Get a set.
 */
function obiba_mica_sets_set($document_type = 'variables', $set_id) {
  $resource = new ObibaSetsResources();
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $resource->getSet($document_type, $set_id);
  } else {
    $result = $resource->deleteSet($document_type, $set_id);
  }

  drupal_json_output($result);
}

/**
 * Check a identifiers is in a set.
 */
function obiba_mica_sets_set_document_exists($document_type = 'variables', $set_id, $document_id) {
  $resource = new ObibaSetsResources();
  $result = $resource->existsInSet($document_type, $set_id, $document_id);
  drupal_json_output($result);
}

/**
 * Importing a list of identifiers in a set.
 */
function obiba_mica_sets_set_documents_import($document_type = 'variables', $set_id) {
  $resource = new ObibaSetsResources();
  $body = file_get_contents('php://input');
  $result = $resource->importSet($document_type, $set_id, $body);
  drupal_json_output($result);
}

function obiba_mica_sets_opal_views_download($document_type = 'variables', $set_id) {
  $resource = new ObibaSetsResources();
  $ids = $_POST['ids'];

  $response = $resource->getOpalViews($document_type, $set_id, $ids);

  if (!empty($response)) {
    $headers = $resource->getLastResponseHeaders();
    drupal_add_http_header('Content-Disposition', $headers['Content-Disposition'][0]);
    ob_clean();
    $zip_response = $response->body;
    print $zip_response;
    exit;
  }
}

/**
 * Importing a identifiers matchng a query in a set.
 */
function obiba_mica_sets_set_documents_import_query($document_type = 'variables', $set_id) {
  $resource = new ObibaSetsResources();
  $query = $_POST['query'];
  $result = $resource->importQuerySet($document_type, $set_id, $query);
  drupal_json_output($result);
}

/**
 * Remove a list of identifiers from a set.
 */
function obiba_mica_sets_set_documents_remove($document_type = 'variables', $set_id) {
  $resource = new ObibaSetsResources();
  $body = file_get_contents('php://input');
  $result = $resource->removeFromSet($document_type, $set_id, $body);
  drupal_json_output($result);
}

/**
 * Get the list of identifiers from a set.
 */
function obiba_mica_sets_set_documents_list($document_type = 'variables', $set_id, $from = 0, $limit = 10) {
  $resource = new ObibaSetsResources();
  $result = $resource->listSet($document_type, $set_id, $from, $limit);
  drupal_json_output($result);
}

/**
 * Clear the list of identifiers from a set.
 */
function obiba_mica_sets_set_documents_clear($document_type = 'variables', $set_id) {
  $resource = new ObibaSetsResources();
  $result = $resource->clearSet($document_type, $set_id);
  drupal_json_output($result);
}