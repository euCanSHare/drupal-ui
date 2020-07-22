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
 * MicaClient class
 */


namespace Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient;

use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;

class DrupalMicaHttpClient implements MicaHttpClientInterface {

  function __construct() {
  }

  function getMicaHttpClient($authentication = NULL, $formatter = NULL, $request_alter = FALSE, $delegate = NULL) {
    $getHttpClient = MicaConfig\MicaDrupalConfig::GET_HTTP_CLIENT;
    $http_client = $getHttpClient($authentication, $formatter, $request_alter, $delegate);
    return $http_client;
  }

  function getMicaHttpClientRequest($url, $values = array()) {
    $getHttpClientRequest = MicaConfig\MicaDrupalConfig::GET_HTTP_CLIENT_REQUEST;
    $http_client_request = $getHttpClientRequest($url, $values);
    return $http_client_request;
  }

  function getMicaHttpClientStaticMethod($method) {
    $getHttpMethod = MicaConfig\MicaDrupalConfig::GET_HTTP_CLIENT_REQUEST_METHOD;
    return $getHttpMethod($method);
  }

  function MicaClientAddHttpHeader($headerParameter, $value) {
    $addHttpHeader = MicaConfig\MicaDrupalConfig::CLIENT_ADD_HTTP_HEADER;
    $addHttpHeader($headerParameter, $value);
  }


  function getMicaHttpClientException() {
    $clientHttpException = MicaConfig\MicaDrupalConfig::GET_HTTP_CLIENT_EXCEPTION;
    return $clientHttpException;
  }

}
