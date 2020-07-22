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
 * MicaNetworkResource class
 */
use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;
use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient\DrupalMicaClientResourcePathHelper as ResourcesWsPath;

/**
 * Class MicaNetworkResource
 */
class DrupalMicaNetworkResource extends DrupalMicaClientResource {

  public function __construct($mica_url = NULL) {
    parent::__construct($mica_url);
  }

  /**get_networks
   * Get the list of networks.
   *
   * @param null $study_id
   * @param null $query
   * @param int $from
   * @param int $limit
   * @param null $sort field name to sort by
   * @param null $order "asc" or "desc"
   * @param null $fields
   * @return array|mixed
   * @throws Exception
   */
  public function getNetworks($study_id = NULL, $query = NULL, $from = 0, $limit = 5, $sort = NULL, $order = NULL, $fields = NULL) {
    $this->setLastResponse(NULL);

    $url_networks = $this->generateRqlQuery($study_id, $query, $from, $limit, $sort, $order, $fields);
    $cache_stored_data = $this->drupalCache->MicaGetCache(__FUNCTION__ . $url_networks);

    if ($cache_stored_data !== FALSE) {
      return $cache_stored_data;
    }

    $request = new HttpClientRequest($this->micaUrl . $url_networks, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      )
    ));

    $client = $this->client();

    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $network_join_response_wrapper = !empty($data) ? new DrupalMicaClient\NetworkJoinResponseWrapper(json_decode($data)) : NULL;
      $this->drupalCache->MicaSetCache(__FUNCTION__ . $url_networks, $network_join_response_wrapper);
      return $network_join_response_wrapper;

    } catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to mica fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        ), WATCHDOG_WARNING);
      $message_parameters['message'] = 'Error contacting Mica, please try again later. Error serve code : @code, message: @message';
      $message_parameters['placeholders'] = array(
        '@code' => $e->getCode(),
        '@message' => $e->getMessage()
      );
      $message_parameters['severity'] = 'error';
      if ($e->getCode() == 500 || $e->getCode() == 503 || $e->getCode() == 0) {
        DrupalMicaClientResource::DrupalMicaErrorHandler(TRUE, $message_parameters);
      }
      drupal_set_message(t($message_parameters['message'], $message_parameters['placeholders']), $message_parameters['severity']);

      throw $e;
    } catch (Exception $e) {
      drupal_set_message('Error contacting Mica, please try again later.', 'error');
      watchdog('Mica Client', 'Unexpected error, exception @exception', array('@exception' => $e), WATCHDOG_ERROR);
      throw $e;
    }
    return FALSE;
  }

  /**
   * Get the list of network details.
   *
   * @param null $networkIds
   * @return array|mixed
   */
  public function getNetworkDetails($networkIds) {
    $this->setLastResponse(NULL);

    $resource_query = '/networks/_rql?query=' . DrupalMicaClient\RqlQueryBuilder::network_queries(array(
      DrupalMicaClient\RqlQueryBuilder::in_query("Mica_network", "id", $networkIds),
      DrupalMicaClient\RqlQueryBuilder::sort_query("", "acronym"),
      DrupalMicaClient\RqlQueryBuilder::fields_query(array("acronym.*", "name.*", "studyIds")),
      DrupalMicaClient\RqlQueryBuilder::limit_query(0, 9999)
    ));

    $cache_stored_data = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cache_stored_data)) {
      return $cache_stored_data;
    }
    else {
      $url_networks = $this->micaUrl . $resource_query;
      $request = new HttpClientRequest($url_networks, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        )
      ));
      $client = $this->client();
      try {
        $result_resource_query = NULL;
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $response = !empty($data) ? json_decode($data) : NULL;
        if (!empty($response) && !empty($response->networkResultDto) && !empty($response->networkResultDto->{'obiba.mica.NetworkResultDto.result'})) {
          $result_resource_query = $response->networkResultDto->{'obiba.mica.NetworkResultDto.result'};
        }
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $result_resource_query);
          return $result_resource_query;
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
        }
        drupal_set_message(t($message_parameters['message'],$message_parameters['placeholders']),  $message_parameters['severity']);
      }
    }
    return FALSE;
  }

  /**
   * Get a network by its ID.
   *
   * @param $network_id
   * @return array
   */
  public function getNetwork($network_id, $token_key = NULL) {
    $resource_query = '/network/' . rawurlencode($network_id);
    if (!empty($token_key)) {
      $resource_query = '/draft/network/' . rawurlencode($network_id) . '?key=' . $token_key;
    }
    $this->setLastResponse(NULL);
    $cached_network = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cached_network)) {
      return $cached_network;
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
        $network_response = !empty($data) ? json_decode($data) : NULL;
        $this->updateModel($network_response);
        $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $network_response);
        return $network_response;
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
        }
        if (obiba_mica_commons_is_ajax()) {
          $message_parameters['message'] = 'Connection to server fail,  Error serve code : @code, message: @message';
          $message_parameters['placeholders'] = array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage()
          );
          $message_parameters['severity'] = 'error';
          DrupalMicaClientResource::DrupalMicaErrorHandler(NULL, $message_parameters);
        }
        else {
          $this->setLastResponse($client->lastResponse);
          drupal_set_message(t($message_parameters['message'], $message_parameters['placeholders']), $message_parameters['severity']);
        }
      }
    }
  }

  private function updateModel($obj) {
    if (!empty($obj->content)) {
      $obj->model = json_decode($obj->content);
    }
    else {
      $obj->model = new stdClass();
    }
  }

  private function generateRqlQuery($study_id, $query, $from, $limit, $sort, $order, $fields = NULL) {
    global $language;
    $rql_queries = array();
    $from = empty($from) ? '0' : $from;
    $limit = empty($limit) ? '5' : $limit;

    array_push($rql_queries, DrupalMicaClient\RqlQueryBuilder::limit_query($from, $limit));

    $query_rql = empty($query)
      ? DrupalMicaClient\RqlQueryBuilder::exists_query("Mica_network", "id")
      : DrupalMicaClient\RqlQueryBuilder::match_query($query, "Mica_network", array("name", "acronym", "description"));

    if (!empty($study_id)) {
      array_push($rql_queries,
        DrupalMicaClient\RqlQueryBuilder::and_query(
          $query_rql,
          DrupalMicaClient\RqlQueryBuilder::in_query("Mica_network", "studyIds", $study_id)
        ));
    } else {
      array_push($rql_queries, $query_rql);
    }

    array_push(
      $rql_queries,
      DrupalMicaClient\RqlQueryBuilder::sort_query(
        empty($order) ? '' : ($order == 'desc' ? '-' : ''),
        empty($sort) ? "name" : $sort)
    );

    if (NULL !== $fields) {
      array_push(
        $rql_queries,
        DrupalMicaClient\RqlQueryBuilder::fields_query($fields)
      );
    }

    $params = DrupalMicaClient\RqlQueryBuilder::network_queries($rql_queries). ",locale($language->language)";
    return ResourcesWsPath::getResourcePath(ResourcesWsPath::WS_NETWORKS_SEARCH, array($params));
  }
}