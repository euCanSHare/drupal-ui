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

namespace Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient;

use Obiba\ObibaMicaClient\MicaCache as MicaCache;
use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;
use Obiba\ObibaMicaClient\MicaWatchDog as MicaWatchDog;
/**
 * Class MicaStudyResource
 */
class DrupalMicaClientTaxonomyResource extends MicaClient {

  /**
   * Instance initialisation.
   *
   * @param string $mica_url
   *   The Mica server url.
   */
  public function __construct($mica_url = NULL) {
    parent::__construct($mica_url,
      new MicaCache\MicaDrupalClientCache(),
      new MicaConfig\MicaDrupalConfig(),
      new MicaWatchDog\MicaDrupalClientWatchDog());
  }

  /**
   * Get taxonomy summaries.
   *
   * @return object
   *   The taxonomy summaries wrapper.
   */
  public function getTaxonomySummaries($resource) {
    $this->setLastResponse(NULL);
    $url_studies = $this->micaUrl . '/taxonomies/'. $resource;
    $request = $this->getMicaHttpClientRequest($url_studies, array(
      'method' => $this->getMicaHttpClientStaticMethod('METHOD_GET'),
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
    catch (\HttpClientException $e) {
      $this->drupalWatchDog->MicaWatchDog('MicaTaxonomyResource',
        'Connection to server fail,  Error serve code : @code, message: @message',
        array('@code' => $e->getCode(), '@message' => $e->getMessage()),
        $this->drupalWatchDog->MicaWatchDogSeverity('WARNING'));
      return array();
    }
  }

}
