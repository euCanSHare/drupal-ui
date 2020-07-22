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
 * Class definition server resources.
 */

use \Obiba\ObibaMicaClient\MicaCache as MicaCache;

/**
 * Class MicaStudyResource
 */
class DrupalMicaPersonsResource extends DrupalMicaClientResource {
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
   * Search for persons..
   *
   * @param null $query
   * @param int $from
   * @param null $limit
   * @param null $sort
   * @param null $order
   *
   * @return array|mixed
   */
  public function search($query = NULL, $from = 0, $limit = NULL, $sort = NULL, $order = NULL) {
    $params = empty($from) ? 'from=0' : 'from=' . $from;
    $params .= empty($limit) ? '&limit=999' : '&limit=' . $limit;
    $params .= empty($sort) ? '' : '&sort=' . $sort;
    $params .= empty($order) ? '' : '&order=' . $order;
    $params .= empty($query) ? '' : '&query=' . $query;
    $url_studies_person = $this->micaUrl . '/persons/_search?' . $params;
    $request = new HttpClientRequest($url_studies_person, array(
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
      return json_decode($data);
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

  /**
   * Download the persons search result as a CSV file.
   *
   * @param null $query
   * @param int $from
   * @param null $limit
   * @param null $sort
   * @param null $order
   *
   * @return array
   */
  public function download($query = NULL, $from = 0, $limit = NULL, $sort = NULL, $order = NULL) {
    $params = empty($from) ? 'from=0' : 'from=' . $from;
    $params .= empty($limit) ? '&limit=999' : '&limit=' . $limit;
    $params .= empty($sort) ? '' : '&sort=' . $sort;
    $params .= empty($order) ? '' : '&order=' . $order;
    $params .= empty($query) ? '' : '&query=' . $query;
    $url_studies_person = $this->micaUrl . '/persons/_search?' . $params;
    $request = new HttpClientRequest($url_studies_person, array(
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
