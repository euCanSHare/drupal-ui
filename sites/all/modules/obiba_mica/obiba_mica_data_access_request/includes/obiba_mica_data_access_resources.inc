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

/**
 * Class MicaDataAccessRequestResources
 */
class DrupalMicaDataAccessRequestResources extends DrupalMicaClientResource {

  protected $method;

  /**
   * Instance initialisation.
   *
   * @param string $mica_url
   *   The mica server url.
   * @param string $method
   *   THe method to query the server.
   */
  public function __construct($mica_url = NULL, $method = 'METHOD_POST') {
    parent::__construct($mica_url);
    $this->method = $method;
  }

  /**
   * Save a  data access request.
   *
   * @param string $data
   *   The data access request json data.
   * @param string $resource
   *   The server resource.
   * @param string $id_data_access
   *   The data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function dataAccessSave($data, $resource, $id_data_access = NULL) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $url_data_access = $this->micaUrl . $resource . ($id_data_access ? '/' . $id_data_access : '');
    $request = new HttpClientRequest($url_data_access, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
          'Content-Type' => array(parent::HEADER_JSON),

        )
      ),
      'data' => $data,
    ));

    $this->execute($request);
    $headers = $this->getLastResponseHeaders();
    if (!empty($headers) && !empty($headers['Location'])) {
      drupal_add_http_header('Location', $headers['Location'][0]);
    }

    drupal_add_http_header('Status', $this->getLastResponseStatusCode());
    return $this->getLastResponse();
  }

  public function dataAccessStartDateSave($id_data_access, $date) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $url_data_access = $this->micaUrl . '/data-access-request/' . $id_data_access . '/_start-date?date=' . $date;
    $request = new HttpClientRequest($url_data_access, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    $this->execute($request);
    $headers = $this->getLastResponseHeaders();
    if (!empty($headers) && !empty($headers['Location'])) {
      drupal_add_http_header('Location', $headers['Location'][0]);
    }

    drupal_add_http_header('Status', $this->getLastResponseStatusCode());
    return $this->getLastResponse();
  }

  public function dataAccessActionLogsSave($data, $id_data_access) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $url_data_access = $this->micaUrl . '/data-access-request/' . $id_data_access . '/_log-actions';
    $request = new HttpClientRequest($url_data_access, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
          'Content-Type' => array(parent::HEADER_JSON),

        )
      ),
      'data' => $data,
    ));

    $this->execute($request);
    $headers = $this->getLastResponseHeaders();
    if (!empty($headers) && !empty($headers['Location'])) {
      drupal_add_http_header('Location', $headers['Location'][0]);
    }

    drupal_add_http_header('Status', $this->getLastResponseStatusCode());
    return $this->getLastResponse();
  }

  /**
   * Save a  data access request.
   *
   * @param string $data
   *   The data access request json data.
   * @param string $resource
   *   The server resource.
   * @param string $id_data_access
   *   The data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function dataAccessAmendmentSave($data, $resource) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $url_data_access = $this->micaUrl . $resource;
    $request = new HttpClientRequest($url_data_access, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
          'Content-Type' => array(parent::HEADER_JSON),

        )
      ),
      'data' => $data,
    ));

    $this->execute($request);
    $headers = $this->getLastResponseHeaders();
    if (!empty($headers) && !empty($headers['Location'])) {
      drupal_add_http_header('Location', $headers['Location'][0]);
    }

    drupal_add_http_header('Status', $this->getLastResponseStatusCode());
    return $this->getLastResponse();
  }

  /**
   * Update attachments of a data access request.
   *
   * @param string $data
   *   The data access request json data.
   * @param string $id_data_access
   *   The required data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function saveAttachments($data, $id_data_access = NULL) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $url_data_access = $this->micaUrl . '/data-access-request/' . $id_data_access . '/_attachments';
    $request = new HttpClientRequest($url_data_access, array(
        'method' => $constant_method,
        'headers' => $this->authorizationHeader(array(
                'Accept' => array(parent::HEADER_JSON),
                'Content-Type' => array(parent::HEADER_JSON),

            )
        ),
        'data' => $data,
    ));

    $this->execute($request);
    $headers = $this->getLastResponseHeaders();

    if (!empty($headers) && !empty($headers['Location'])) {
      drupal_add_http_header('Location', $headers['Location'][0]);
    }

    drupal_add_http_header('Status', $this->getLastResponseStatusCode());

    return $this->getLastResponse();
  }

  /**
   * A common method to execute client request.
   *
   * @param object $request
   *   The http client request..
   *
   * @return array
   *   The data server response.
   */
  protected function execute($request) {
    $client = $this->client();
    try {
      $response = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      return json_decode($response);
    }
    catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), WATCHDOG_WARNING);
      /*  drupal_set_message(t('An error occurred and processing did not
      complete Mica Server error: @message',
      array('@message' => $e->getMessage())),
      'error');*/
      drupal_add_http_header('Status', $e->getCode());
      return empty($client->lastResponse->body) ? FALSE : json_decode($client->lastResponse->body);
    }

  }

}
