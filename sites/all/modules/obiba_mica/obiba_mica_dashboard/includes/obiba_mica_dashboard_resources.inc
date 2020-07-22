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
class MicaMetricsResource extends DrupalMicaClientResource
{
  const METRIC_RESOURCE_URL = '/config/metrics';

  function __construct() {
    parent::__construct(NULL);
  }

  public function getMetrics()
  {

    $this->setLastResponse(NULL);
    $resource_url = $this->micaUrl . self::METRIC_RESOURCE_URL;
    $request = new HttpClientRequest($resource_url, array(
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
      return json_decode($data);
    } catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        ), WATCHDOG_WARNING);
    }
    return FALSE;
  }
}