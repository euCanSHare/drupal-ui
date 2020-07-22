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

use \Obiba\ObibaMicaClient\MicaCache as MicaCache;

/**
 * @file
 * Mica networks file
 */
class ObibaSearchResources extends DrupalMicaClientResource {
  const MICA_REPOSITORY = 'mica/repository';

  function __construct() {
    parent::__construct(NULL);
  }

  public function searchQuery($type, $query) {
    $resource = '/' . $type . '/_rql';
    return $this->httpRequestPostBuilder($resource, array('query' => $query), !$this->hasQuerySetsField($query));
  }

  public function searchQueryAsCsv($type, $query) {
    return $this->downloadCsvExport('/' . $type . '/_rql_csv', array('query' => $query));
  }

  public function searchStudyQueryAsCsvReport($query) {
    return $this->downloadCsvExport('/studies/_report', array('query' => $query));
  }

  public function searchStudyQueryAsCsvReportByNetwork($networkId, $locale) {
    return $this->downloadCsvExport('/studies/_report_by_network', array('networkId' => $networkId, 'locale' => $locale));
  }

  public function taxonomiesSearch($query, $target, $locale) {
    $resource = '/taxonomies/_search?query=' . rawurlencode($query)
      . (!empty($target) ? '&target=' . $target : '')
      . (!empty($locale) ? '&locale=' . $locale : '');
    return $this->httpRequestGetBuilder($resource);
  }

  public function listSuggestionFilter($target, $query, $locale) {
    $resource = '/' . $target . '/_suggest?query=' . rawurlencode($query)
      . (!empty($locale) ? '&locale=' . $locale : '');
    return $this->httpRequestGetBuilder($resource);
  }

  public function taxonomiesFilter($target, $query = NULL) {
    $resource = '/taxonomies/_filter?target=' . $target . (empty($query) ? '' : '&query=' . urlencode($query));
    return $this->httpRequestGetBuilder($resource);
  }

  public function taxonomyFilter($name, $target) {
    $resource = '/taxonomy/' . $name . '/_filter?target=' . $target;
    return $this->httpRequestGetBuilder($resource);
  }

  public function variablesCoverage($query, $withZeros) {
    $resource = '/variables/_coverage';
    return $this->httpRequestPostBuilder($resource, array('query' => $query, 'withZeros' => $withZeros), !$this->hasQuerySetsField($query));
  }

  public function variablesCoverageDownload($query, $header_accept) {
    $resource = '/variables/_coverage_download';
    return $this->httpRequestPostBuilder($resource, array('query' => $query), !$this->hasQuerySetsField($query), $header_accept);
  }

  static function repositoryAnchor($url, $text, array $attributes, array $query_params) {
    $options = array();

    // Drupal may require css classes to be inside an array!
    if (!empty($attributes) && !empty($attributes['class'])) {
      $attributes['class'] = self::formatClassAsArray($attributes['class']);
    }

    if (!empty($attributes)) {
      $options['attributes'] = $attributes;
    }
    if (!empty($query_params)) {
      if (empty($query_params['query'])) {
        unset($query_params['query']);
      }
      $options['fragment'] = '/search?' . http_build_query($query_params);
    }
    return l($text, $url, $options);
  }

  public function taxonomiesChartRql($query, $type, $aggregation_type, $includeTerms) {

    $request_parameters = array(
      'query' => $query,
      'includeTerms' => $includeTerms ? 'true' : 'false'
    );

    $stored_data = $this->drupalCache->MicaGetCache(__FUNCTION__ . $query);
    if ($stored_data !== FALSE) {
      return $stored_data;
    }

    $url = "$this->micaUrl/variables/charts/_coverage";
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON)
        )
      ),
      'parameters' => $request_parameters,
    ));

    $client = $this->client();
    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);

      $result_data = json_decode((!empty($data) ? $data : '{"charts":[]}'));
      $this->drupalCache->MicaSetCache(__FUNCTION__ . $query, $result_data);
      return $result_data;

    } catch (HttpClientException $e) {
      if ($e->getCode() == 403) {
        drupal_set_message('<i class="glyphicon glyphicon-info-sign"></i> Please set correct credentials access to mica-server', 'warning');
      }
      watchdog('Mica Client', 'Connection to Mica fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        ), WATCHDOG_WARNING);

      throw $e;
    } catch (Exception $e) {
      watchdog('Mica Client', 'Connection to Mica fail,  Error serve code : @exception',
        array(
          '@exception' => $e,
        ), WATCHDOG_ERROR);

      throw $e;
    }
  }

  /**
   * Format class as array.
   *
   * @param string $class
   *   A class to add.
   *
   * @return array
   *   A formatted class array.
   */
  public static function formatClassAsArray($class) {
    return is_array($class) ? $class : explode(' ', $class);
  }

  static function repositoryRqlBuilder($query = NULL, $bucket = NULL, $taxonomy_name = NULL, $vocabulary_name = NULL, $entity_id = NULL) {
    $query_search = '';
    if (!empty($taxonomy_name)) {
      if (!empty($vocabulary_name)) {
        $query_search = 'variable(and(exists(' . $taxonomy_name . '.' . $vocabulary_name . '),in(Mica_variable.';
      }
    }
    if (is_array($entity_id)) {
      $entity_id = implode(',', $entity_id);
    }

    if (!empty($query)) {
      $query_search .= 'datasetId,' . $entity_id;
    }
    else {
      switch ($bucket->field) {
        case 'studyId' :
          $query_search .= 'studyId,' . $bucket->value;
          break;
        case 'dceId' :
          $query_search .= 'dceId,' . urlencode(urlencode($bucket->value));
      }
    }
    $query_search .= ')))&display=list&type=variables';
    return $query_search;
  }

  /**
   * The query builder for charts.
   *
   * @param string $query
   *   The query for the charts.
   * @param object $bucket
   *   The bucket.
   * @param string $taxonomy_name
   *   The taxonomy name.
   * @param string $vocabulary_name
   *   The vocabulary name.
   * @param array $terms
   *   The terms.
   *
   * @return string
   *   A json query.
   */
  public static function chartQueryBuilders($query = NULL, $bucket = NULL, $taxonomy_name = NULL, $vocabulary_name = NULL, array $terms = NULL, $entity_id = NULL) {
    return ObibaSearchResources::repositoryRqlBuilder($query, $bucket, $taxonomy_name, $vocabulary_name, $entity_id);
  }

  private function hasQuerySetsField($query) {
    if (empty($query)) {
      return FALSE;
    }
    return strpos($query, 'Mica_variable.sets') !== FALSE;
  }

  private function httpRequestPostBuilder($resource, $form_params, $use_cache = TRUE, $header_accept = parent::HEADER_JSON) {
    $content = NULL;
    if (!empty($form_params)) {
      $params = array();
      foreach ($form_params as $key => $value) {
        array_push($params, rawurlencode($key) . '=' . rawurlencode($value));
      }
      $content = implode('&', $params);
    }

    $url = $this->micaUrl . $resource;

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_POST,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array($header_accept),
          'Content-Type' => array('application/x-www-form-urlencoded')
        )
      ),
      'data' => $content
    ));

    $full_resource = $use_cache ? $resource . '?' . $content : NULL;
    return $this->do_request($full_resource, $request);
  }

  private function httpRequestGetBuilder($resource, $header_accept = parent::HEADER_JSON) {
    $url = $this->micaUrl . $resource;

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array($header_accept),
          'Content-Type' => array($header_accept)
        )
      )
    ));
    return $this->do_request($resource, $request);
  }

  /**
   * Do the request and use the resource string to cache the response (do not cache if resource string is empty).
   */
  private function do_request($resource, $request) {
    $client = $this->client();
    if (!empty($resource)) {
      $stored_data = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource);
      if ($stored_data !== FALSE){
        return $stored_data;
      }
    }

    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $response = !empty($data) ? json_decode($data) : NULL;
      if (!empty($response)) {
        $this->getLogo($response);
      }
      if (!empty($resource)) {
        $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource, $response);
      }
      return $response;
    } catch (HttpClientException $e) {

      if ($e->getCode() == 403) {
        $error_level = WATCHDOG_WARNING;
        drupal_set_message('<i class="glyphicon glyphicon-info-sign"></i> Please set correct credentials access to mica-server', 'warning');
      } else {
        $error_level = WATCHDOG_ERROR;
        drupal_set_message('<i class="glyphicon glyphicon-info-sign"></i> Error contacting Mica, please try again later.', 'error');
      }

      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        ), $error_level);

      $this->MicaClientAddHttpHeader('Status', $e->getCode());
      throw $e;

    } catch (Exception $e) {

      drupal_set_message('<i class="glyphicon glyphicon-info-sign"></i> Error contacting Mica, please try again later.', 'error');
      watchdog('Mica Client', 'Unexpected error, exception @exception', array('@exception' => $e), WATCHDOG_ERROR);
      throw $e;
    }
  }

  private function getLogo($result_search){
    if(!empty($result_search->studyResultDto->{'obiba.mica.StudyResultDto.result'}->summaries)){
      foreach ($result_search->studyResultDto->{'obiba.mica.StudyResultDto.result'}->summaries as $key => $summary){
        if(!empty($summary->logo->id)){
          $result_search->studyResultDto->{'obiba.mica.StudyResultDto.result'}->summaries[$key]->logoUrl = obiba_mica_commons_safe_expose_server_url($summary->id, $summary->logo, 'study');
        }
      }
    }
    if(!empty($result_search->networkResultDto->{'obiba.mica.NetworkResultDto.result'}->networks)){
      foreach ($result_search->networkResultDto->{'obiba.mica.NetworkResultDto.result'}->networks as $key => $summary){
        if(!empty($summary->logo->id)){
          $result_search->networkResultDto->{'obiba.mica.NetworkResultDto.result'}->networks[$key]->logoUrl = obiba_mica_commons_safe_expose_server_url($summary->id, $summary->logo, 'network');
        }
      }
    }
    return $result_search;
  }

  private function downloadCsvExport($resource, $form_params) {
    $content = NULL;
    if (!empty($form_params)) {
      $params = array();
      foreach ($form_params as $key => $value) {
        array_push($params, rawurlencode($key) . '=' . rawurlencode($value));
      }
      $content = implode('&', $params);
    }

    $url = $this->micaUrl . $resource;
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_POST,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(DrupalMicaClientResource::HEADER_CSV),
          'Content-Type' => array('application/x-www-form-urlencoded')
        )
      ),
      'data' => $content
    ));

    $client = $this->client();
    try {
      $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      return $client->lastResponse;
    }
    catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        ), WATCHDOG_WARNING);
      return array();
    }
  }

}
