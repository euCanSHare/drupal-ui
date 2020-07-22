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
 * Data access request resources class
 */

$path_module_data_access = drupal_get_path('module', 'obiba_mica_data_access_request');

include_once $path_module_data_access . '/includes/obiba_mica_data_access_resources.inc';

/**
 * Class MicaDataAccessRequests
 */
class MicaDataAccessRequests extends DrupalMicaDataAccessRequestResources {

  /**
   * Instance initialisation.
   *
   * @param string $mica_url
   *   The mica server url.
   * @param string $method
   *   THe method to query the server.
   */
  public function __construct($mica_url = NULL, $method = 'METHOD_POST') {
    parent::__construct($mica_url, $method);
  }

  /**
   * Get data access requests list.
   *
   * @return array
   *   The data server response.
   */
  public function getRequests() {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-requests';

    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
    ));

    return $this->execute($request);
  }

  /**
   * Get data access requests list.
   *
   * @return array
   *   The data server response.
   */
  public function getAmendmets($parent_id) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/'.$parent_id.'/amendments';

    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
    ));

    return $this->execute($request);
  }

  public function downloadCsvExport($lang) {
    return $this->downloadCsv('/data-access-requests/csv', $lang);
  }

  public function downloadHistory($lang) {
    return $this->downloadCsv('/data-access-requests/_history', $lang);
  }

  private function downloadCsv($resurce, $lang) {

    $url_data_access_request_csv_export = $this->micaUrl . $resurce . '?lang=' . $lang;

    $request = new HttpClientRequest($url_data_access_request_csv_export, array(
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
