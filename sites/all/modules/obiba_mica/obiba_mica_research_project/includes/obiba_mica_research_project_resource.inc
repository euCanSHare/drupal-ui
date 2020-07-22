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
 * Research project resource class
 */

use \Obiba\ObibaMicaClient\MicaCache as MicaCache;

/**
 * Class MicaResearchProjectResource
 */
class DrupalMicaResearchProjectResource extends DrupalMicaClientResource {

  /**
   * MicaResearchProjectResource constructor.
   *
   * @param null|string $mica_url
   */
  public function __construct($mica_url) {
    parent::__construct($mica_url);
  }

  /**
   * @param null $query
   * @param int $from
   * @param int $limit
   * @param null $sort
   * @param null $order
   * @return array|mixed
   */
  public function getProjects($query = NULL, $from = 0, $limit = 5, $sort = NULL, $order = NULL) {
    global $language;
    $this->setLastResponse(NULL);
    $params = empty($from) ? 'from=0' : 'from=' . $from;
    $params .= empty($limit) ? '&limit=5' : '&limit=' . $limit;
    $params .= empty($sort) ? '&sort=title.' .  $language->language : '&sort=' . $sort;
    $params .= empty($order) ? '&order=asc' : '&order=' . $order;
    $params .= empty($query) ? '' : '&query=' . $query;
    $resource_query = '/projects?' . $params;

    $cached_projects = $this->drupalCache->MicaGetCache($resource_query);
    if (!empty($cached_projects)) {
      return $cached_projects;
    }
    else {
      $url_projects = $this->micaUrl . $resource_query;
      $request = new HttpClientRequest($url_projects, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON)
          )
        )
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $result_projects = !empty($data) ? json_decode($data) : NULL;
        $this->drupalCache->MicaSetCache($resource_query, $result_projects);
        return $result_projects;
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
   * @return array|mixed
   */
  public function getProjectsWithAccessibleDAR() {
    $this->setLastResponse(NULL);
    $resource_query = '/projects/dar_accessible';
    $url_projects = $this->micaUrl . $resource_query;
    $cached_dar_projects = $this->drupalCache->MicaGetCache($resource_query);
    if (!empty($cached_dar_projects)) {
      return $cached_dar_projects;
    }
    else {
      $request = new HttpClientRequest($url_projects, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON)
          )
        )
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $result_dar_projects = !empty($data) ? json_decode($data) : NULL;
        $this->drupalCache->MicaSetCache($resource_query, $result_dar_projects);
        return $result_dar_projects;
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
   * @param $project_id
   * @return array|null
   */
  public function getProject($project_id, $token_key = NULL) {
    $resource_query = '/project/' . rawurlencode($project_id);
    if(!empty($token_key)){
      $resource_query = '/draft/project/' . rawurlencode($project_id) . '?key=' . $token_key;
    }
    $this->setLastResponse(NULL);
    $cached_project = $this->drupalCache->MicaGetCache($resource_query);
    $url = $this->micaUrl . $resource_query;
    if(!empty($cached_project)){
      return $cached_project;
    }
    else {
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON)
          )
        ),
      ));
      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $result_project = !empty($data) ? json_decode($data) : NULL;
        $this->drupalCache->MicaSetCache($resource_query, $result_project);
        return $result_project;
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
        drupal_set_message(t($message_parameters['message'],$message_parameters['placeholders']),  $message_parameters['severity']);
      }
    }
  }

  public function getFormDefinition() {
    $url = $this->micaUrl . '/config/project/form';
    $this->setLastResponse(NULL);
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));
    $client = $this->client();
    try {
      $response = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      return json_decode($response);
    } catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), WATCHDOG_WARNING);
      drupal_add_http_header('Status', $e->getCode());
      return empty($client->lastResponse->body) ? FALSE : json_decode($client->lastResponse->body);
    }
  }
}