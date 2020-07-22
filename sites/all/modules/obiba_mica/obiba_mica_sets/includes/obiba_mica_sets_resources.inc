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
  *
  */
class ObibaSetsResources extends DrupalMicaClientResource {
  const MICA_SETS = 'mica/sets';

  function __construct() {
    parent::__construct(NULL);
  }

  private function httpRequestPostBuilder($resource, $body, $header_accept = parent::HEADER_JSON) {
    $content = $body;
    $url = $this->micaUrl . $resource;

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_POST,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array($header_accept),
          'Content-Type' => array('text/plain')
        )
      ),
      'data' => $content
    ));
    return $this->do_request(NULL, $request);
  }

  private function httpRequestFormPostBuilder($resource, $form_params, $header_accept = parent::HEADER_JSON) {
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
    return $this->do_request($resource, $request);
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

  private function httpRequestDeleteBuilder($resource, $header_accept = parent::HEADER_JSON) {
    $url = $this->micaUrl . $resource;

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_DELETE,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array($header_accept),
          'Content-Type' => array($header_accept)
        )
      )
    ));
    return $this->do_request($resource, $request);
  }

  private function do_request($resource, $request) {
    $client = $this->client();

    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $response = !empty($data) ? json_decode($data) : NULL;
      return $response;
    } catch (HttpClientException $e) {

      if ($e->getCode() == 403) {
        $error_level = WATCHDOG_WARNING;
      } else {
        $error_level = WATCHDOG_ERROR;
      }

      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        ), $error_level);

      $this->MicaClientAddHttpHeader('Status', $e->getCode());
      return empty($client->lastResponse->body) ? FALSE : json_decode($client->lastResponse->body);
    }
  }

  public function createSet($document_type, $body = NULL, $name = NULL) {
    $resource = '/' . $document_type . '/sets/_import' . ($name == NULL ? '' : '?name=' . urlencode($name));
    return $this->httpRequestPostBuilder($resource, $body);
  }

  public function getSets($document_type) {
    $resource = '/' . $document_type . '/sets';
    return $this->httpRequestGetBuilder($resource);
  }

  public function getSet($document_type, $set_id) {
    $resource = '/' . $document_type . '/set/' . $set_id;
    return $this->httpRequestGetBuilder($resource);
  }

  public function existsInSet($document_type, $set_id, $document_id) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/document/' . $document_id . '/_exists';
    return $this->httpRequestGetBuilder($resource);
  }

  public function getOpalViews($document_type, $set_id, $ids) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/documents/_opal';
    $url = $this->micaUrl . $resource;

    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_POST,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array('application/octet-stream')
        )
      ),
      'parameters' => ['ids' => $ids]
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

  public function importSet($document_type, $set_id, $body = NULL) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/documents/_import';
    return $this->httpRequestPostBuilder($resource, $body);
  }

  public function importQuerySet($document_type, $set_id, $query) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/documents/_rql';
    return $this->httpRequestFormPostBuilder($resource, array('query' => $query));
  }

  public function removeFromSet($document_type, $set_id, $body = NULL) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/documents/_delete';
    return $this->httpRequestPostBuilder($resource, $body);
  }

  public function listSet($document_type, $set_id, $from, $limit) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/documents?from=' . $from . '&limit=' . $limit;
    return $this->httpRequestGetBuilder($resource);
  }

  public function clearSet($document_type, $set_id) {
    $resource = '/' . $document_type . '/set/' . $set_id . '/documents';
    return $this->httpRequestDeleteBuilder($resource);
  }

  public function deleteSet($document_type, $set_id) {
    $resource = '/' . $document_type . '/set/' . $set_id;
    return $this->httpRequestDeleteBuilder($resource);
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

}
