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
 * Class MicaDataAccessRequest
 */
class MicaDataAccessRequest extends DrupalMicaDataAccessRequestResources {
  const LIST_DATA_ACCESS = 'list-data-access';
  const NEW_DATA_ACCESS = 'new-data-access';
  const LIST_USERS_DATA_ACCESS = 'list-user-data-access';

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
   * Get the form definition of data access request from mica server.
   *
   * @return string
   *   Json definition of the form (Angular schema-Form).
   */
  public function getFormDefinition() {
    $url = $this->micaUrl . '/config/data-access-form';
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  /**
   * Get the form definition of data access request from mica server.
   *
   * @return string
   *   Json definition of the form (Angular schema-Form).
   */
  public function getAmendmentFormDefinition() {
    $url = $this->micaUrl . '/config/data-access-amendment-form';
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  /**
   * Get a data access request from the server.
   *
   * @param string $id
   *   The data access request id.
   *
   * @return string
   *   Json form definition of the data access request (Angular schema-Form).
   */
  public function getRequest($id) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $id;
    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  public function getAmendmentsRequestHistory($id) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $id . '/amendments/_history';
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
   * Get a data access request from the server.
   *
   * @param string $id
   *   The data access request id.
   *
   * @return string
   *   Json form definition of the data access request (Angular schema-Form).
   */
  public function getAmendment($parent_id, $id) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $parent_id . '/amendment/'. $id;
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
   * GEt Pdf format of an data access request.
   *
   * @param string $id
   *   The data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function downloadPdf($id, $lang) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $id . '/_pdf';

    if(isset($lang)) {
      $url_requests .= '?lang=' . $lang;
    }

    $request = new HttpClientRequest($url_requests, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));
    $client = $this->client();
    try {
      $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $headers = $this->getLastResponseHeaders();
      $responses['response'] = $this->getLastResponse();
      $responses['headers'] = $headers;
      return $responses;
    }
    catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), WATCHDOG_WARNING);
      return $e->getResponse();
    }

  }

  /**
   * Download data access request attachments.
   *
   * @param string $id_request
   *   The data access request id.
   * @param string $id_file
   *   The data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function downloadAttachment($id_request, $id_file) {
    $url_requests = $this->micaUrl . '/data-access-request/' . $id_request . '/attachments/' . $id_file . '/_download';

    return $this->downloadAttachmentInternal($url_requests);
  }

  /**
   * Download data access request form attachment.
   *
   * @param $path_request
   *  request path - <entity-name>/<id>. Here entity-path will be 'data-access-request'
   * @param $file_name
   * @param $file_id
   * @return array
   *  The data server response.
   * @throws Exception
   * @internal param string $id_request The data access request id.*   The data access request id.
   * @internal param string $id_file The data access request id.*   The data access request id.
   *
   */
  public function downloadFormAttachment($path_request, $file_name, $file_id) {
    if (empty($path_request)) {
      throw new Exception('Request path cannot be null');
    }

    $parts = explode('/', ltrim($path_request, '/'));
    $url_requests = sprintf("%s/data-access-request/%s/form/attachments/%s/%s/_download",
      $this->micaUrl,
      $parts[1],
      urlencode($file_name),
      $file_id
    );

    return $this->downloadAttachmentInternal($url_requests);
  }

  private function downloadAttachmentInternal($url_requests) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $this->setLastResponse(NULL);
    $request = new HttpClientRequest($url_requests, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));
    $client = $this->client();
    try {
      $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $headers = $this->getLastResponseHeaders();
      $responses['response'] = $this->getLastResponse();
      $responses['headers'] = $headers;
      return $responses;
    }
    catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), WATCHDOG_WARNING);
      return $e->getResponse();
    }

  }

  /**
   * Delete an data access request.
   *
   * @param string $id
   *   The data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function deleteRequest($id) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $id;

    $request = new HttpClientRequest($url_requests, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  /**
   * Delete an data access amendment.
   *
   * @param string $parent_id
   *   The data access request id.
   *
   * @param string $id
   *   The data access request id.
   *
   * @return array
   *   The data server response.
   */
  public function deleteAmendment($parent_id, $id) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $parent_id . '/amendment/' . $id;

    $request = new HttpClientRequest($url_requests, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  /**
   * Update data access request status.
   *
   * @param string $id
   *   The data access request id.
   * @param string $status
   *   The status to update to.
   *
   * @return array
   *   The data server response.
   */
  public function statusUpdateRequest($id, $status) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $id . '/_status?to=' . $status;

    $request = new HttpClientRequest($url_requests, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  /**
   * Update data access amendment status.
   *
   * @param $parent_id
   *   Corresponding data access object.
   * @param string $id
   *   The data access request id.
   * @param string $status
   *   The status to update to.
   *
   * @return array
   *   The data server response.
   */
  public function amendmentStatusUpdateRequest($parent_id, $id, $status) {
    $constant_method = constant('HttpClientRequest::' . $this->method);
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/data-access-request/' . $parent_id . '/amendment/' . $id . '/_status?to=' . $status;

    $request = new HttpClientRequest($url_requests, array(
      'method' => $constant_method,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  public function getUserProfile($user_id){
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/user/' . $user_id . '/application/drupal';
    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      )
    ));

    return $this->execute($request);
  }

  public function getUsersList(){
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . '/users/application/drupal';
    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      )
    ));

    return $this->execute($request);
  }

}
