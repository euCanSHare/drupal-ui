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
  * 
  */
class ObibaAnalysisResources extends DrupalMicaClientResource {
  const MICA_ANALYSIS = 'mica/analysis';
  const CROSSTAB = 'mica/variables';

  function __construct() {
    parent::__construct(NULL);
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

  private function do_request($resource, $request) {
    $client = $this->client();
    $stored_data = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource);
    if ($stored_data !== FALSE){
      return $stored_data;
    }

    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $response = !empty($data) ? json_decode($data) : NULL;
      $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource, $response);
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

  public function entitiesCountQuery($query) {
    $resource = '/datasets/entities/_count?query=' . rawurlencode($query);
    return $this->httpRequestGetBuilder($resource);
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
