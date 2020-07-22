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

interface MicaHttpClientInterface{
  function getMicaHttpClientStaticMethod($method);
  function getMicaHttpClient($authentication = NULL, $formatter = NULL, $request_alter = FALSE, $delegate = NULL);
  function getMicaHttpClientRequest($url, $values = array());
  function MicaClientAddHttpHeader($headerParameter, $value);
  function getMicaHttpClientException();
}