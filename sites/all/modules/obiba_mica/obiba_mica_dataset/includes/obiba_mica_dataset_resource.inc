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
 * MicaStudyResource class
 */

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;
use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient\DrupalMicaClientResourcePathHelper as ResourcesWsPath;

/**
 * Class MicaStudyResource
 */
class DrupalMicaDatasetResource extends DrupalMicaClientResource {
  const DEFAULT_PRIMARY_BUTTON_CLASSES = 'btn highlight btn btn-primary';
  const DATASETS = 'mica/dataset';
  const COLLECTED_VARIABLE = 'Collected';
  const COLLECTED_DATASET = 'collected-dataset';
  const COLLECTED_DATASET_LINK = 'mica/collected-dataset/{id}';
  const ALL_DATASETS = 'datasets';
  const HARMONIZED_DATASET = 'harmonized-dataset';
  const HARMONIZED_DATASET_LINK = 'mica/harmonized-dataset/{id}';
  const HARMONIZATION_VARIABLE = 'mica/variable/{id}:{name}:Dataschema';
  /**
   * Instance initialisation.
   *
   * @param string $mica_url
   *   The mica server url.
   */
  public function __construct($mica_url = NULL) {
    parent::__construct($mica_url);
  }

  /**
   * Get the list of datasets.
   *
   * @param null $class_name
   * @param int $study_id
   *   The study id.
   * @param string $query
   *   The query in http request.
   * @param int $from
   *   The from item.
   * @param int $limit
   *   The size response server.
   * @param string $sort
   *   Field name to sort by.
   * @param string $order
   *   the sort "asc" or "desc".
   * @return array Server response.
   * Server response.
   * @internal param string $resource The resource to query.*   The resource to query.
   */
  public function getDatasets($class_name = NULL, $study_id = NULL, $query = NULL, $from = 0, $limit = 50, $sort = NULL, $order = NULL, $fields = NULL) {
    $this->setLastResponse(NULL);
    $resource_query = $this->generateRqlQuery($class_name, $study_id, $query, $from, $limit, $sort, $order, $fields);
    $cached_datasets = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);

    if (!empty($cached_datasets)) {
      return $cached_datasets;
    }
    else {
      $url_datasets = $this->micaUrl . $resource_query;
      $request = new HttpClientRequest($url_datasets, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
          $datasets_result = !empty($data) ? new DrupalMicaClient\DatasetJoinResponseWrapper(json_decode($data)) : NULL;
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $datasets_result);
          return $datasets_result;
      } catch (HttpClientException $e) {
        watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
          array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage()
          ), WATCHDOG_WARNING);
        return array();
      }
    }
  }

  /**
   * @param $class_name
   * @param $study_id
   * @param $query
   * @param $from
   * @param $limit
   * @param $sort
   * @param $order
   * @param null $fields
   * @return string
   * @internal param $language
   * @internal param $studies_type
   */
  private function generateRqlQuery($class_name, $study_id, $query, $from, $limit, $sort, $order, $fields = NULL) {
    global $language;
    $dataset_rql_queries = array();
    $from = empty($from) ? '0' : $from;
    $limit = empty($limit) ? '5' : $limit;

    array_push($dataset_rql_queries, DrupalMicaClient\RqlQueryBuilder::limit_query($from, $limit));

    if (!empty($query) && !empty($class_name)) {
      array_push($dataset_rql_queries,
        DrupalMicaClient\RqlQueryBuilder::and_query(
          DrupalMicaClient\RqlQueryBuilder::match_query($query, "Mica_dataset", array("name", "acronym", "description")),
          DrupalMicaClient\RqlQueryBuilder::className_query("Mica_dataset", $class_name)
        )
      );
    } elseif (!empty($query) && empty($class_name)) {
      array_push(
        $dataset_rql_queries,
        DrupalMicaClient\RqlQueryBuilder::match_query(
          $query,
          "Mica_dataset",
          array("name", "acronym", "description")
        )
      );
    } elseif (empty($query) && !empty($class_name)) {
      array_push($dataset_rql_queries, DrupalMicaClient\RqlQueryBuilder::className_query("Mica_dataset", $class_name));
    } else {
      array_push($dataset_rql_queries, DrupalMicaClient\RqlQueryBuilder::exists_query("Mica_dataset", "id"));
    }

    array_push(
      $dataset_rql_queries,
      DrupalMicaClient\RqlQueryBuilder::sort_query(
        empty($order) ? '' : ($order == 'desc' ? '-' : ''),
        empty($sort) ? "name" : $sort)
    );

    if (NULL !== $fields) {
      array_push(
        $dataset_rql_queries,
        DrupalMicaClient\RqlQueryBuilder::fields_query($fields)
      );
    }

    $rql_query = DrupalMicaClient\RqlQueryBuilder::dataset_queries($dataset_rql_queries). ",locale($language->language)";

    if (!empty($study_id)) {
      $rql_query = sprintf("%s,%s",
        $rql_query,
        DrupalMicaClient\RqlQueryBuilder::study_query(
          DrupalMicaClient\RqlQueryBuilder::in_query("Mica_study", "id",  rawurlencode($study_id))
        )
      );
    }
    return ResourcesWsPath::getResourcePath(ResourcesWsPath::WS_DATASETS_SEARCH, array($rql_query));
  }

  /**
   * Get a dataset by its ID.
   *
   * @param string $dataset_id
   *   The dataset id.
   * @param string $resource
   *   The resource to query.
   *
   * @param null $token_key
   * @return array The server response.
   * The server response.
   * @throws Exception
   */
  public function getDataset($dataset_id, $resource = 'dataset', $token_key = NULL) {
    $resource_query = (empty($resource) ? 'dataset' : $resource) . '/' . $dataset_id;
    if(!empty($token_key)){
      $resource_query = 'draft/' . (empty($resource) ? 'dataset' : $resource) . '/' . $dataset_id . '?key=' . $token_key;
    }
    $this->setLastResponse(NULL);
    $cached_dataset = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    $url = $this->micaUrl . '/' . $resource_query;
    if (!empty($cached_dataset)) {
      return $cached_dataset;
    }
    else {
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));

      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $result_dataset = !empty($data) ? json_decode($data) : NULL;
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $result_dataset);
          return $result_dataset;
      } catch (HttpClientException $e) {
        watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
          array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage()
          ), WATCHDOG_WARNING);
        $message_parameters['message'] = 'Connection to server fail,  Error serve code : @code, message: @message';
        $message_parameters['placeholders'] = array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        );
        $message_parameters['severity'] = 'error';
        if ($e->getCode() == 500 || $e->getCode() == 503 || $e->getCode() == 0) {
          DrupalMicaClientResource::DrupalMicaErrorHandler(TRUE, $message_parameters);
          throw $e;
        }
        if (obiba_mica_commons_is_ajax()) {
          DrupalMicaClientResource::DrupalMicaErrorHandler(NULL, $message_parameters);
        }
        else {
          drupal_set_message(t($message_parameters['message'], $message_parameters['placeholders']), $message_parameters['severity']);
        }
      }
    }
  }

  /**
   * Get the list of variables of the dataset.
   *
   * @param string $resource
   *   The resource to query.
   * @param string $dataset_id
   *   The dataset id.
   * @param int $from
   *   The from item.
   * @param int $limit
   *   The size response server.
   * @param string $sort
   *   Field name to sort by.
   * @param string $order
   *   the sort "asc" or "desc".
   * @param string $query
   *   The query in http request.
   *
   * @return array
   *   The server response.
   */
  public function getVariables($resource, $dataset_id, $from = 0, $limit = -1, $sort = NULL, $order = NULL, $query = NULL) {
    $this->setLastResponse(NULL);
    $params = empty($from) ? 'from=0' : 'from=' . $from;
    $params .= empty($limit) ? '&limit=-1' : '&limit=' . $limit;
    $params .= empty($sort) ? '' : '&sort=' . $sort;
    $params .= empty($order) ? '' : '&order=' . $order;
    $params .= empty($query) ? '' : '&query=' . urlencode($query);
    $resource_query = (empty($resource) ? 'dataset' : $resource) .
      '/' . rawurlencode($dataset_id) .
      '/variables' . (empty($query) ? ''
        : '/_search') . '?' . $params;
    $url = $this->micaUrl . '/' . $resource_query;
    $cached_variables_dataset = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cached_variables_dataset)) {
      return $cached_variables_dataset;
    }
    else {
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
          $variables_result = !empty($data) ? json_decode($data) : NULL;
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $variables_result);
          return $variables_result;
      } catch (HttpClientException $e) {
        return array();
      }
    }
  }

  /**
   * Query the cross variables.
   *
   * @param string $resource
   *   The resource to query.
   * @param string $dataset_id
   *   The dataset id.
   * @param string $variable1
   *   The variable 1 id.
   * @param string $variable2
   *   The variable 2 id.
   *
   * @return stdClass
   *   The server response.
   */
  public function crossVariables($resource, $dataset_id, $variable1, $variable2) {
    $this->setLastResponse(NULL);
    $params = empty($variable2) ? '' : 'by=' . $variable2;
    $cross_variables_resource = (empty($resource) ? 'dataset' : $resource)
      . '/' . rawurlencode($dataset_id) .
      '/variable/' . (empty($variable1) ? '' : $variable1) . '/contingency?' . $params;
    $cached_variables_cross_table = $this->drupalCache->MicaGetCache(__FUNCTION__ . $cross_variables_resource);
    if (!empty($cached_variables_cross_table)) {
      return $cached_variables_cross_table;
    }
    else {
      $url = $this->micaUrl . '/' . $cross_variables_resource;
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
          $result_data = !empty($data) ? json_decode($data) : NULL;
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $cross_variables_resource, $result_data);
          return $result_data;

      } catch (HttpClientException $e) {
        return new stdClass();
      }
    }
  }

  /**
   * Download the cross variables.
   *
   * @param string $resource
   *   The resource to query.
   * @param string $dataset_id
   *   The dataset id.
   * @param string $variable1
   *   The variable 1 id.
   * @param string $variable2
   *   The variable 2 id.
   * @param string $doc_type
   *   The type download file.
   *
   * @return array
   *   The server response.
   */
  public function downloadCrossVariables($resource, $dataset_id, $variable1, $variable2, $doc_type) {
    $this->setLastResponse(NULL);
    $params = empty($variable2) ? '' : 'by=' . $variable2;
    $url = $this->micaUrl . '/' . (empty($resource) ? 'dataset' : $resource) . '/' . rawurlencode($dataset_id)
      . '/variable/' . (empty($variable1) ? '' : $variable1) . '/contingency/_export?' . $params;

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(
        $doc_type === 'csv' ? array('Accept' => array(parent::HEADER_CSV)) : array('Accept' => array(parent::HEADER_EXCEL_SHEET))
      ),
    ));
    $client = $this->client();
    try {
      $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      return $client->lastResponse;
    } catch (HttpClientException $e) {
      return array();
    }
  }

  /**
   * Get the list variable harmonization status for a harmonization dataset.
   *
   * @param string $resource
   *   The resource to query.
   * @param string $dataset_id
   *   The dataset id.
   * @param int $from
   *   The from item.
   * @param int $limit
   *   The size response server.
   * @param string $sort
   *   Field name to sort by.
   * @param string $order
   *   the sort "asc" or "desc".
   * @param string $query
   *   The query in http request.
   *
   * @return array
   *   The server response.
   */
  public function getVariablesHarmonizations($resource, $dataset_id, $from = 0, $limit = -1, $sort = NULL, $order = NULL, $query = NULL) {
    $this->setLastResponse(NULL);
    $params = empty($from) ? 'from=0' : 'from=' . $from;
    $params .= empty($limit) ? '&limit=-1' : '&limit=' . $limit;
    $params .= empty($sort) ? '' : '&sort=' . $sort;
    $params .= empty($order) ? '' : '&order=' . $order;
    $params .= empty($query) ? '' : '&query=' . $query;

$get_tresource_by_type = function($resource){
  $convert_resource = array(
    self::HARMONIZED_DATASET => DrupalMicaClient\DrupalMicaClientResourcePathHelper::WS_HARMONIZED_DATASET
  );
  return $convert_resource[$resource];
};
//    $query_resources = (empty($resource) ? 'dataset' : $resource)
    $query_resources = (empty($resource) ? 'dataset' : $get_tresource_by_type($resource))
      . '/' . rawurlencode($dataset_id) .
      '/variables/harmonizations?' . $params;
    $Cached_variables_harmonized = $this->drupalCache->MicaGetCache(__FUNCTION__ . $query_resources);
    if (!empty($Cached_variables_harmonized)) {
      return $Cached_variables_harmonized;
    }
    else {
      $url = $this->micaUrl . '/' . $query_resources;
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
          $variable_result = !empty($data) ? json_decode($data) : NULL;
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $query_resources, $variable_result);
          return $variable_result;
      } catch (HttpClientException $e) {
        if (obiba_mica_commons_is_ajax()) {
          $message_parameters['message'] = 'Connection to server fail,  Error serve code : @code, message: @message';
          $message_parameters['placeholders'] = array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage()
          );
          $message_parameters['severity'] = 'error';
          DrupalMicaClientResource::DrupalMicaErrorHandler(NULL, $message_parameters);
        }
        else{
          return array();
        }
      }
    }
  }

  /**
   * Download the variables harmonizations.
   *
   * @param string $dataset_id
   *   The dataset id.
   * @param string $locale
   *   The local of variable.
   *
   * @return array
   *   The server response.
   */
  public function downloadVariablesHarmonizations($dataset_id, $locale) {
    $this->setLastResponse(NULL);
    $url = $this->micaUrl . '/' .  DrupalMicaDatasetResource::HARMONIZED_DATASET . '/' . rawurlencode($dataset_id) . '/variables/harmonizations/_export';
    if (!empty($locale)) {
      $url .= '?locale=' . $locale;
    }

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_CSV),
        )
      ),
    ));
    $client = $this->client();
    try {
      $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      return $client->lastResponse;
    } catch (HttpClientException $e) {
      return array();
    }
  }

  /**
   * Get the variable by its ID.
   *
   * @param string $variable_id
   *   The variable id.
   *
   * @return array
   *   The server response.
   */
  public function getVariable($variable_id) {
    global $language;
    $resource_query = sprintf("/variable/%s?locale=%s", rawurlencode(urldecode($variable_id)), $language->language);
    $this->setLastResponse(NULL);
    $cached_variable = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cached_variable)) {
      return $cached_variable;
    }
    else {
      $url = $this->micaUrl . $resource_query;
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $result_variable = !empty($data) ? json_decode($data) : NULL;
      } catch (HttpClientException $e) {
        if($e->getCode() != 404){
          watchdog('Obiba Mica', 'Request failed, @code: @message',
            array(
              '@code' => $e->getCode(),
              '@message' => $e->getMessage(),
            ), WATCHDOG_WARNING);
          return array();
        }
        else{
          $result_variable = array();
        }
      }
      $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $result_variable);
      return $result_variable;
    }
  }

  /**
   * Get the variable summary by its ID.
   *
   * @param string $variable_id
   *   The variable id.
   *
   * @return array
   *   The server response.
   */
  public function getVariableSummary($variable_id) {
    $resource_query = sprintf("/variable/%s/summary", rawurlencode($variable_id));
    $this->setLastResponse(NULL);
    $cached_summary = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cached_summary)) {
      return $cached_summary;
    }
    else {
      $url = $this->micaUrl . $resource_query;
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $result_summary = !empty($data) ? json_decode($data) : NULL;
      } catch (HttpClientException $e) {
        if($e->getCode() != 404){
          watchdog('Obiba Mica', 'Request failed, @code: @message',
            array(
              '@code' => $e->getCode(),
              '@message' => $e->getMessage(),
            ), WATCHDOG_WARNING);
          return array();
        }
        else{
          $result_summary = array();
        }
      }
      $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $result_summary);
      return $result_summary;
    }
  }

  /**
   * Get the aggregation (=summary from ES) of the variable.
   *
   * @param string $variable_id
   *   The variable id.
   *
   * @return array
   *   The server response.
   */
  public function getVariableAggregation($variable_id) {
    $this->setLastResponse(NULL);
    $variable_aggregation_resource = '/variable/' . rawurlencode($variable_id) . '/aggregation';
    $variable_aggregations = $this->drupalCache->MicaGetCache(__FUNCTION__ . $variable_aggregation_resource);
    if (!empty($variable_aggregations)) {
      return $variable_aggregations;
    }
    else {
      $url = $this->micaUrl . $variable_aggregation_resource;
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
          $variable_aggregation_response = !empty($data) ? json_decode($data) : NULL;
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $variable_aggregation_resource, $variable_aggregation_response);
          return $variable_aggregation_response;
      } catch (HttpClientException $e) {
        return array();
      }
    }
  }

  /**
   * Get the harmonizations of a dataschema variable.
   *
   * @param string $variable_id
   *   The variable id.
   *
   * @return array
   *   The server response.
   */
  public function getVariableHarmonizations($variable_id) {
    $this->setLastResponse(NULL);
    $resource_request = '/variable/' . rawurlencode($variable_id) . '/harmonizations';
    $cached_variable_harmonization = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_request);
    if (!empty($cached_variable_harmonization)) {
      return $cached_variable_harmonization;
    }
    $url = $this->micaUrl . $resource_request;
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));
    $client = $this->client();
    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
        $response_data = !empty($data) ? json_decode($data) : NULL;
        $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_request, $response_data);
        return $response_data;
    } catch (HttpClientException $e) {
      return array();
    }
  }

  ##### RESOURCES PATH #######
  /**
   * GEt the dataset dto.
   *
   * @param object $dataset
   *   The dataset dto'
   *
   * @return object
   *   Study/Harmonization dataset.
   */
  public static function dataset($dataset) {
    if (!empty($dataset->variableType)) {
      return $dataset->variableType == self::COLLECTED_VARIABLE ? self::studyDataset($dataset->id) : self::harmonizationDataset($dataset->id);
    }
    if (!empty($dataset->_extensions)) {
      if ($dataset->hasExtension('obiba.mica.CollectedDatasetDto.type')) {
        return self::studyDataset($dataset->id);
      }
      if ($dataset->hasExtension('obiba.mica.HarmonizedDatasetDto.type')) {
        return self::harmonizationDataset($dataset->id);
      }
    }

    return self::studyDataset($dataset->id);
  }

  /**
   * Returns the url to the draft study/harmonization dataset document
   *
   * @param string
   *  Study $id
   * @return string
   */
  public static function dataset_draft_url($dataset) {
    return sprintf("%s/#/%s/%s",
      MicaClientPathProvider::get_mica_url(),
      $dataset->variableType == self::COLLECTED_VARIABLE ? self::COLLECTED_DATASET : self::HARMONIZED_DATASET,
      $dataset->id);
  }

  /**
   * Study dataset anchor link.
   *
   * @param string $text
   *   The text anchor.
   * @param string $study_id
   *   Th study id.
   * @param string $css_class
   *   the affected css class.
   * @param null $test_ref
   *   reference used by UI tester
   *
   * @return string The anchor link.
   * The anchor link.
   */
  public static function studyDatasets($text, $study_id, $css_class = NULL, $test_ref = NULL) {
    return ObibaSearchResources::repositoryAnchor(
      MicaClientPathProvider::REPOSITORY_SEARCH,
      $text,
      array(
        'class' => ($css_class ? $css_class : ''),
        'test-ref' => $test_ref),
      array(
        'type' => 'datasets',
        'query' => 'study(in(Mica_study.id,' . $study_id . '))',
        'display' => 'list'
      ));
  }

  /**
   * The study dataset detail url.
   *
   * @param string $id
   *   Study dataset id.
   *
   * @return string
   *   The url of the study dataset detail.
   */
  public static function studyDataset($id) {
    return preg_replace('/\\{id\\}/', $id, self::COLLECTED_DATASET_LINK, 1);
  }

  /**
   * GEt the variable dataset.
   *
   * @param object $variable
   *   The variable dto.
   *
   * @return object
   *   Study/Harmonization variable dataset.
   */
  public static function variableDataset($variable) {
    return $variable->variableType == self::COLLECTED_VARIABLE ? self::studyDataset($variable->datasetId) : self::harmonizationDataset($variable->datasetId);
  }
  /**
   * The harmonization dataset detail url.
   *
   * @param string $id
   *   Harmonization dataset id.
   *
   * @return string
   *   The url of the harmonization dataset detail.
   */
  public static function harmonizationDataset($id) {
    return preg_replace('/\\{id\\}/', $id, self::HARMONIZED_DATASET_LINK, 1);
  }

  /**
   * Dataset list item.
   *
   * @param object $dataset
   *   The study wrapper.
   *
   * @return string
   *   Formatted list.
   */
  public static function datasetListItem($dataset) {
    return MicaClientAnchorHelper::listItem($dataset, self::dataset($dataset));
  }


  /**
   * The datasets coverage anchor link.
   *
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageDatasets($is_button = FALSE, $bucket = 'dataset') {
    $localize = obiba_mica_commons_mica_server_localisation();
    $label = $localize->getTranslation('harmonized-dataset');
    if ($bucket == 'dataset') {
      $label = $localize->getTranslation('Collected-dataset');
    }
    return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
      variable_get_value('variable_coverage_label') . ' ' . t('by') . ' ' . $label,
      array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
      array(
        'type' => 'datasets',
        'query' => 'dataset(exists(Mica_dataset.id))',
        'display' => 'coverage',
        'bucket' => $bucket
      ));
  }

  /**
   * A search button datasets.
   *
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function searchDatasets($is_button = FALSE, $study_class_name) {
    $query = 'dataset(exists(Mica_dataset.id))';
    if (!empty($study_class_name) && DrupalMicaStudyResource::ALL_STUDIES != $study_class_name) {
      $query = sprintf("%s,%s",
        $query,
        DrupalMicaClient\RqlQueryBuilder::study_query(
          DrupalMicaClient\RqlQueryBuilder::className_query('Mica_study', $study_class_name)
        )
      );
    }
    return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
      variable_get_value('datasets_search_label'),
      array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
      array(
        'type' => 'datasets',
        'query' => $query,
        'display' => 'list'
      ));
  }


  /**
   * Cross tab variable link.
   *
   * @param object $variable
   *   Dataset wrapper.
   *
   * @return string
   *   The anchor link.
   */
  public static function variableCrosstab($variable) {
    $dataset = $variable->variableType === DrupalMicaDatasetResource::COLLECTED_VARIABLE
      ? DrupalMicaDatasetResource::studyDataset($variable->datasetId)
      : DrupalMicaDatasetResource::harmonizationDataset($variable->datasetId);

    $res = l(
      t('Crosstabs'),
      ObibaAnalysisResources::CROSSTAB,
      array(
        'attributes' => array('class' => self::DEFAULT_PRIMARY_BUTTON_CLASSES),
        'fragment' => preg_replace('/mica\\//', '/crosstab/', $dataset) . '/variable/' . $variable->id,
      )
    );

    return $res;
  }

  /**
   * Get an harmonized variable link.
   *
   * @param object $variable
   *   The variable wrapper.
   *
   * @return string
   *   The anchor link.
   */
  public static function variableHarmonized($variable) {
    return l(
      $variable->name,
      self::variableHarmonizedLink($variable)
    );
  }

  /**
   * Cross tab dataset link.
   *
   * @param object $dataset
   *   Dataset wrapper.
   *
   * @return string
   *   The anchor link.
   */
  public static function datasetCrosstab($dataset) {
    $res = l(
      t('Crosstabs'),
      ObibaAnalysisResources::CROSSTAB,
      array(
        'attributes' => array('class' => self::DEFAULT_PRIMARY_BUTTON_CLASSES),
        'fragment' => preg_replace('/mica\\//', '/crosstab/', DrupalMicaDatasetResource::dataset($dataset)),
      )
    );

    return $res;
  }

  /**
   * The harmonized variable detail url.
   *
   * @param object $variable
   *   Harmonized variable entity wrapper.
   *
   * @return string
   *   The url of the harmonized variable detail.
   */
  public static function variableHarmonizedLink($variable) {
    return preg_replace(
      '/(\\{id\\}):(\\{name\\})/',
      "$variable->datasetId:$variable->name",
      self::HARMONIZATION_VARIABLE,
      1
    );
  }

  /**
   * Get dataset list link by variable.
   *
   * @param object $variable
   *   The variable wrapper.
   *
   * @return string
   *   The anchor link.
   */
  public static function variableDatasetLink($variable) {
    $dataset_name = obiba_mica_commons_get_localized_field($variable, 'datasetName');
    return l(
      $dataset_name,
      self::variableDataset($variable)
    );
  }
}
