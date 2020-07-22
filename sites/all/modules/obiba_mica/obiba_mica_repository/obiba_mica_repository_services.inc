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
 * Search for taxonomies
 */
function obiba_mica_repository_taxonomies_search() {
  $taxonomies = array();
  $request_parameters = drupal_get_query_parameters();
  $query = $request_parameters['query'];
  if (!empty($query)) {
    $locale = $request_parameters['locale'];
    $target = array_key_exists('target', $request_parameters) ? $request_parameters['target'] : '';
    $taxonomies_resource = new ObibaSearchResources();
    $taxonomies = $taxonomies_resource->taxonomiesSearch($query, $target, $locale);
  }
  drupal_json_output($taxonomies);
}

/**
 * Get filtered taxonomies
 */
function obiba_mica_repository_taxonomies_filter() {
  $taxonomies = array();
  $request_parameters = drupal_get_query_parameters();
  if (!empty($request_parameters['target'])) {
    $taxonomy_query = !empty($request_parameters['query']) ? $request_parameters['query'] : NULL;
    $taxonomies_resource = new ObibaSearchResources();
    $taxonomies = $taxonomies_resource->taxonomiesFilter($request_parameters['target'], $taxonomy_query);
  }
  drupal_json_output($taxonomies);
}

/**
 * Get filtered taxonomy
 */
function obiba_mica_angular_search_taxonomy_filter($name) {
  $taxonomy = array();
  $request_parameters = drupal_get_query_parameters();
  if (!empty($request_parameters['target'])) {
    $taxonomies_resource = new ObibaSearchResources();
    $taxonomy = $taxonomies_resource->taxonomyFilter($name, $request_parameters['target']);
  }
  drupal_json_output($taxonomy);
}

/**
 * Get Vocabulary detail by $taxonomy
 */
function obiba_mica_repository_query($type, $query = NULL) {
  $search_resource = new ObibaSearchResources();
  $q = $query;
  if (empty($q) && !empty($_POST['query'])) {
    $q = $_POST['query'];
  }
  $search_result = $search_resource->searchQuery($type, $q);
  drupal_json_output($search_result);
}

/**
 * Get Vocabulary detail by $taxonomy as csv
 */
function obiba_mica_repository_query_as_csv($type) {
  $q = extract_parameter();

  $search_resource = new ObibaSearchResources();
  $response = $search_resource->searchQueryAsCsv($type, $q);

  if (!empty($response)) {
    $headers = $search_resource->getLastResponseHeaders();
    drupal_add_http_header('Content-Disposition', $headers['Content-Disposition'][0]);
    ob_clean();
    $csv_response = $response->body;
    print $csv_response;
    exit;
  }
}

function obiba_mica_repository_query_as_csv_report() {
  $q = extract_parameter();

  $search_resource = new ObibaSearchResources();
  $response = $search_resource->searchStudyQueryAsCsvReport($q);

  if (!empty($response)) {
    $headers = $search_resource->getLastResponseHeaders();
    drupal_add_http_header('Content-Disposition', $headers['Content-Disposition'][0]);
    ob_clean();
    $csv_response = $response->body;
    print $csv_response;
    exit;
  }
}

function obiba_mica_repository_query_as_csv_report_by_network($networkId, $locale) {
  $search_resource = new ObibaSearchResources();
  $response = $search_resource->searchStudyQueryAsCsvReportByNetwork($networkId, $locale);

  if (!empty($response)) {
    $headers = $search_resource->getLastResponseHeaders();
    drupal_add_http_header('Content-Disposition', $headers['Content-Disposition'][0]);
    ob_clean();
    $csv_response = $response->body;
    print $csv_response;
    exit;
  }
}

/**
 * Get Vocabulary detail by $taxonomy
 */
function obiba_mica_repository_variable_coverage($query = NULL) {
  $search_resource = new ObibaSearchResources();
  $q = $query;
  $withZerosParam = empty($_POST['withZeros']) ? true : $_POST['withZeros'] === 'true';
  $withZeros = $withZerosParam ? 'true' : 'false'; // must be in string so urlencode does not convert 'true' to 1

  if (empty($q) && !empty($_POST['query'])) {
    $q = $_POST['query'];
  }

  $search_result = $search_resource->variablesCoverage($q, $withZeros);
  drupal_json_output($search_result);
}

/**
 * Get Vocabulary detail by $taxonomy
 */
function obiba_mica_repository_variable_coverage_download() {
  $q = extract_parameter();

  $search_resource = new ObibaSearchResources();
  $search_resource->variablesCoverageDownload($q, DrupalMicaClientResource::HEADER_CSV);
  $response = !empty($search_resource->getLastResponse()->body) ? $search_resource->getLastResponse()->body : NULL;
  if (!empty($response)) {
    $headers = $search_resource->getLastResponseHeaders();
    $content_mime = $headers['Content-Type'][0];
    $content_disposition = $headers['Content-Disposition'][0];
    $copyright_notice = variable_get_value('mica_copyright_notice');
    $output = !empty($copyright_notice) ? '"' . t($copyright_notice) . '"' . chr(13) : '';
    $output .= $response;
  }
  drupal_add_http_header('Content-Type', $content_mime . '; utf-8');
  drupal_add_http_header('Content-Disposition', $content_disposition);
  ob_clean();
  print $output;
  exit;
}

function obiba_mica_repository_get_document_suggestion($target) {
  $search_resource = new ObibaSearchResources();
  $request_parameters = drupal_get_query_parameters();
  $query = $request_parameters['query'];
  if (!empty($query)) {
    $locale = $request_parameters['locale'];
    drupal_json_output($search_resource->listSuggestionFilter($target, $query, $locale));
  }
}

/**
 * Extract the specified parameter's value from a request
 */
function extract_parameter($parameter_name='query') {
  $q = NULL;

  if (!empty($_POST[$parameter_name])) {
    $q = $_POST[$parameter_name];
  }

  if (empty($q) && !empty($_GET[$parameter_name])) {
    $q = $_GET[$parameter_name];
  }

  return rawurldecode($q);
}