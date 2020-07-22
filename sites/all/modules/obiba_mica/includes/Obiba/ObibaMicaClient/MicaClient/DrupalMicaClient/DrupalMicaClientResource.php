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

use Obiba\ObibaMicaClient\MicaCache as MicaCache;
use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;
use Obiba\ObibaMicaClient\MicaWatchDog as MicaWatchDog;

/**
 * Class DrupalMicaClient
 */
class MicaClient extends DrupalMicaHttpClient{
  const AUTHORIZATION_HEADER = 'Authorization';
  const COOKIE_HEADER = 'Cookie';
  const SET_COOKIE_HEADER = 'Set-Cookie';
  const OBIBA_COOKIE = 'obibaid';
  const MICA_COOKIE = 'micasid';
  const HEADER_BINARY = 'application/octet-stream';
  const HEADER_JSON = 'application/json';
  const HEADER_CSV = 'text/csv';
  const HEADER_EXCEL_SHEET = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const HEADER_TEXT = 'text/plain';
  const PAGINATE_STUDIES = 0;
  const PAGINATE_VARIABLES = 1;
  const PAGINATE_DATASETS = 2;
  const PAGINATE_NETWORKS = 3;

  protected $micaUrl;
  public $drupalCache;
  public $drupalConfig;
  public $drupalWatchDog;

  private $lastResponse;
  private static $responsePageSizeSmall = 10;
  private static $responsePageSize = 20;


  /**
   * Instance initialisation.
   *
   * Mica client from a given url or from the one retrieved from 'mica_url'
   * variable.
   *
   * @param string $mica_url
   *   IF given,  the Mica server url, the  default value is a a setting
   *   parameter
   * @param MicaCache\MicaCacheInterface $micaCache
   * @param MicaConfig\MicaConfigInterface $micaConfig
   * @param MicaWatchDog\MicaWatchDogInterface $micaWatchDog
   *
   */
  public function __construct($mica_url = NULL,
                              MicaCache\MicaCacheInterface $micaCache,
                              MicaConfig\MicaConfigInterface $micaConfig,
                              MicaWatchDog\MicaWatchDogInterface $micaWatchDog
  ) {
    $this->drupalCache = $micaCache;
    $this->drupalConfig = $micaConfig;
    $this->drupalWatchDog = $micaWatchDog;
    $this->micaUrl = (isset($mica_url) ? $mica_url : $this->drupalConfig->MicaGetConfig('mica_url')) . '/ws';
    self::$responsePageSize = $this->drupalConfig->MicaGetConfig('mica_response_page_size');
    self::$responsePageSizeSmall = $this->drupalConfig->MicaGetConfig('mica_response_page_size_small');

  }

  /**
   * Make sure we are not using previous session state.
   */
  public static function clear() {
    unset($_SESSION[self::MICA_COOKIE]);
  }

  /**
   * Get the last response (if any).
   *
   * @return array
   *   The response server formatted as an array.
   */
  public function getLastResponse() {
    return $this->lastResponse;
  }

  /**
   * Set the last response cookies after a http call.
   *
   * @param array $last_response
   *   The server response.
   */
  protected function setLastResponse($last_response) {
    $this->lastResponse = $last_response;
    if (isset($last_response)) {
      $this->setLastResponseCookies();
    }
  }

  /**
   * Get the last reposnse status code
   *
   * @return
   *   The status code
   */
  public function getLastResponseStatusCode() {
    if ($this->lastResponse != NULL) {
      return $this->lastResponse->responseCode;
    }
    return NULL;
  }

  /**
   * Get the last response headers (if any).
   *
   * @return array
   *   The header response server.
   */
  public function getLastResponseHeaders() {
    if ($this->lastResponse) {
      return $this->getHeaders($this->lastResponse->headers);
    }

    return array();
  }

  public function getHeaders($headers) {
    if ($headers != NULL) {
      $result = array();
      foreach (explode("\r\n", $headers) as $header) {
        $h = explode(":", $header, 2);
        if (count($h) == 2) {
          if (!array_key_exists($h[0], $result)) {
            $result[$h[0]] = array();
          }
          array_push($result[$h[0]], trim($h[1]));
        }
      }
      return $result;
    }
    return array();
  }

  /**
   * Send a logout request to Mica and clean drupal client cookies.
   */
  public function logout() {
    $url = $this->micaUrl . '/auth/session/_current';
    $request = $this->getMicaHttpClientRequest($url, array(
      'method' => $this->getMicaHttpClientStaticMethod('METHOD_DELETE'),
      'headers' => $this->authorizationHeader(array(
        'Accept' => array(HEADER_JSON),
      )),
    ));

    $client = $this->client();
    try {
      $client->execute($request);
      $this->lastResponse = $client->lastResponse;
      $this->setLastResponseCookies();
      unset($_SESSION[self::MICA_COOKIE]);
    } catch (\HttpClientException $e) {
      $this->drupalWatchDog->MicaWatchDog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), $this->drupalWatchDog->MicaWatchDogSeverity('WARNING'));
      $this->lastResponse = $client->lastResponse;
      $this->setLastResponseCookies();
      unset($_SESSION[self::MICA_COOKIE]);
    }
  }

  /**
   * Get the header value(s) from the last response.
   *
   * @param string $header_name
   *   The header information to extract.
   *
   * @return array
   *   The value of header name.
   */
  protected function getLastResponseHeader($header_name) {
    $headers = $this->getLastResponseHeaders();

    if (array_key_exists($header_name, $headers)) {
      return $headers[$header_name];
    }
    return array();
  }

  /**
   * Forwards the 'Set-Cookie' directive(s) to the drupal client.
   *
   * If the user was authenticated by Agate.
   */
  private function setLastResponseCookies() {
    foreach ($this->getLastResponseHeader(self::SET_COOKIE_HEADER) as $cookie_str) {
      $cookie = $this->parseCookie($cookie_str);
      $keys = array_keys($cookie);
      $name = $keys[0];
      $value = $cookie[$name];
      $this->drupalWatchDog->MicaWatchDog('Mica Client',
        'Cookie: name=@name, value=@value',
        array('@name' => $name, '@value' => $value),
        $this->drupalWatchDog->MicaWatchDogSeverity('DEBUG'));
      if (empty($value)) {
        if (!empty($_SESSION[$name])) {
          unset($_SESSION[$name]);
        }
      }
      else {
        $_SESSION[$name] = $value;
      }
    }
  }

  /**
   * Add authorization headers.
   *
   * @param array $headers
   *   A header array.
   *
   * @return array
   *   The transformed initial headers.
   */
  protected function authorizationHeader(array $headers) {
    if (isset($_SESSION[self::OBIBA_COOKIE])) {
      // Authenticate by cookies coming from request (case of regular user
      // logged in via Agate).
      $this->drupalWatchDog->MicaWatchDog('obiba_mica', 'Auth by cookies from request');
      $headers = $this->addCookieHeader($headers, $_SESSION[self::OBIBA_COOKIE],
        isset($_SESSION[self::MICA_COOKIE]) ?
          $_SESSION[self::MICA_COOKIE] : NULL);
    }
    else {
      $this->drupalWatchDog->MicaWatchDog('obiba_mica', 'Auth by anonymous credentials');
      $current_anonymous_pass = $this->drupalConfig->MicaGetConfig('mica_anonymous_password');
      $saved_anonymous_pass = $this->drupalConfig->MicaGetConfig('mica_anonymous_password_saved');

      // always append credentials in case of mica session has expired
      $credentials = $this->drupalConfig->MicaGetConfig('mica_anonymous_name') . ':' . $current_anonymous_pass;
      $headers[self::AUTHORIZATION_HEADER] = array(
        'Basic '
        . base64_encode($credentials),
      );

      // detect if anonymous password was changed
      if ($current_anonymous_pass == $saved_anonymous_pass) {
        if (isset($_SESSION[self::MICA_COOKIE])) {
          $headers = $this->addCookieHeader($headers, NULL,
            $_SESSION[self::MICA_COOKIE]);
        }
      }
      else {
        session_unset();
        $this->drupalConfig->MicaSetConfig('mica_anonymous_password_saved',
          $this->drupalConfig->MicaGetConfig('mica_anonymous_password'));
      }
    }
    return $headers;
  }

  /**
   * Add the cookie Id/value to the header.
   *
   * @param array $headers
   *   The server response header.
   * @param string $obibaid
   *   The obibaid cookie id.
   * @param string $micasid
   *   The micaid cookie id.
   *
   * @return array
   *   The transformed initial headers.
   */
  private
  function addCookieHeader(array $headers, $obibaid, $micasid) {
    $cookie = $this->cookieHeaderValue($obibaid, $micasid);

    if (isset($headers[self::COOKIE_HEADER])) {
      array_push($headers[self::COOKIE_HEADER], $cookie);
    }
    else {
      $headers[self::COOKIE_HEADER] = array($cookie);
    }
    return $headers;
  }

  /**
   * Add authorization by cookies header.
   *
   * @param string $obibaid
   *   The obibaid cookie id.
   * @param string $micasid
   *   The micaid cookie id.
   *
   * @return string
   *   The Value of the cooke.
   */
  private
  function cookieHeaderValue($obibaid, $micasid) {
    $cookie_parts = array();

    if (isset($obibaid)) {
      $cookie_parts[] = self::OBIBA_COOKIE . '=' . $obibaid;
    }

    if (isset($micasid)) {
      $cookie_parts[] = self::MICA_COOKIE . '=' . $micasid;
    }

    return implode("; ", $cookie_parts);
  }

  /**
   * Explode a cookie string in a array.
   *
   * @param string $cookie_str
   *   The cookie string.
   *
   * @return array
   *   The cookie array.
   */
  private
  function parseCookie($cookie_str) {
    $cookie = array();
    foreach (explode(';', $cookie_str) as $entry_str) {
      if (strpos($entry_str, '=')) {
        $entry = explode('=', $entry_str);
        $cookie[$entry[0]] = $entry[1];
      }
      else {
        $cookie[$entry_str] = TRUE;
      }
    }
    return $cookie;
  }

  /**
   * The client object construction overriding the httpClient->client() method.
   *
   * @return object
   *   The overridden object.
   */
  protected
  function client() {
    $default_headers_setter = function ($request) {
      $request->setHeader('Accept-Encoding', 'gzip, deflate');
    };
    $getHttpClient = MicaConfig\MicaDrupalConfig::GET_HTTP_CLIENT;
    $client = $getHttpClient(FALSE, FALSE, $default_headers_setter);

    if (!isset($client->options['curlopts'])) {
      $client->options['curlopts'] = array();
    }

    $client->options['curlopts'] += array(
      CURLOPT_SSL_VERIFYHOST => FALSE,
      CURLOPT_SSL_VERIFYPEER => FALSE,
      CURLOPT_ENCODING => TRUE,
    );
    return $client;
  }

  /**
   * GEt the setting of the samll page size response (for pagination).
   *
   * @return int
   *   The page size.
   */
  public
  static function getResponsePageSizeSmall() {
    return self::$responsePageSizeSmall;
  }

  /**
   * GEt the setting of the page size response (for pagination).
   *
   * @return int
   *   The page size.
   */
  public
  static function getResponsePageSize() {
    $size = empty($_GET['size']) ? self::$responsePageSize : $_GET['size'];
    return $size;
  }

  /**
   * The search list pagination parameters.
   *
   * @param int $current_page
   *   The current page number
   * @param string $type
   *   The entity type.
   * @param int $size
   *   The size server response.
   *
   * @return float|int
   *   The next page offset.
   */
  public function paginationListSearchParameters($current_page = 0, $type = NULL, $size = NULL) {
    return self::nextPageOffset(
      empty($current_page) ? 0 : $current_page,
      empty($size) ? MicaClient::getResponsePageSize() : $size,
      @$_SESSION[strtolower($type)]['aggregations']['total_hits']
    );
  }

  /**
   * Calculate the next offset page.
   *
   * @param int $current_page
   *   The current page number.
   * @param int $size
   *   The size server response.
   * @param int $total
   *   The total in server.
   *
   * @return int
   *   The next page offset.
   */
  public static function nextPageOffset($current_page = 0, $size = NULL, $total = NULL) {
    $nb_pages = ceil($total / $size);
    $from = 0;
    if (!empty($current_page)) {
      $actual_page = intval($current_page);
      if ($actual_page > $nb_pages) {
        $actual_page = $nb_pages;
      }
      $from = ($actual_page) * $size;
    }

    return $from;
  }

  /**
   * Parse a string header response and return an key/value array attributes.
   *
   * @param string $raw_headers
   *   The raw header.
   *
   * @return array
   *   The parsed header on an array.
   */
  protected function parseHeaders($raw_headers) {
    $headers = [];

    foreach (explode("\n", $raw_headers) as $i => $h) {
      $h = explode(':', $h, 2);

      if (isset($h[1])) {
        $headers[$h[0]] = trim($h[1]);
      }
    }
    return $headers;
  }

  /**
   * Get property by given attribute.
   *
   * @param string $attribute
   *   The Attribute to get.
   * @param string $property
   *   The property.
   *
   * @return string
   *   The property value.
   */
  protected function parseHeader($attribute, $property) {
    $attributes_array = explode(';', $attribute);
    foreach ($attributes_array as $property_string) {
      if (strstr($property_string, $property)) {
        return $property_value = str_replace('"', '', explode('=', $property_string)[1]);
      }
    }
    return FALSE;
  }

  /**
   * Return the value of a given key header attribute  (filename, charset).
   *
   * ToDo may be need to be extended to retrieve more attributes(User-Agent,..).
   *
   * @param array $header
   *   The header to parse.
   * @param string $property
   *   The property to find.
   * @param string $attribute
   *   The attribute.
   *
   * @return string
   *   The value of property.
   */
  protected function getPropertyValueFromHeaderArray(array $header, $property, $attribute = NULL) {
    if (!empty($attribute)) {
      return $this->parseHeader($header[$attribute], $property);
    }
    else {
      foreach ($header as $attributes) {
        $find_property_value = $this->parseHeader($attributes, $property);
        if (!empty($find_property_value)) {
          return $find_property_value;
        }
      }
    }
    return NULL;
  }

  /**
   * Get the file extension from file resource.
   *
   * @param string $file_resource
   *   The file name.
   *
   * @return string
   *   The file extension.
   */
  protected function getFileExtension($file_resource) {
    $file_array = explode('.', $file_resource);
    $extension_file = count($file_array);

    return $file_array[$extension_file - 1];
  }

  /**
   * Deal with downloadable resources from server (Images, attachments).
   *
   * @param string $entity_type
   *   Study, dce, network ...
   * @param string $entity_id
   *   The id of the entity.
   * @param string $file_id
   *   The id of the stored file on the server.
   *
   * @return array
   *   containing :
   *    data : The raw file to download
   *    filename : The real file name of the file
   *    raw_header_array : the raw of header response
   *    or in case of error
   *    code : the error code
   *    message : the error message
   */
  public function downloadFile($entity_type, $entity_id, $file_id, $token_key = NULL) {
    $url = $this->micaUrl . "/" . $entity_type . "/" . $entity_id . "/file/" . $file_id . "/_download";
    if(!empty($token_key)){
      $url = $this->micaUrl . "/draft/" . $entity_type . "/" . $entity_id . "/file/" . $file_id . "/_download?key=" . $token_key;
    }
    $request = $this->getMicaHttpClientRequest($url, array(
      'method' => $this->getMicaHttpClientStaticMethod('METHOD_GET'),
      'headers' => self::authorizationHeader(array(
          'Accept' => array(self::HEADER_BINARY),
        )
      ),
    ));

    $client = $this->client();
    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $file_name = $this->getPropertyValueFromHeaderArray($this->parseHeaders($client->lastResponse->headers),
        'filename',
        'Content-Disposition'
      );

      $raw_data = array(
        'extension' => $this->getFileExtension($file_name),
        'data' => $data,
        'filename' => $file_name,
        'raw_header_array' => $this->parseHeaders($client->lastResponse->headers),
      );
      return $raw_data;
    } catch (\HttpClientException $e) {
      $this->drupalWatchDog->MicaWatchDog(
        'Mica Client',
        'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ),
        $this->drupalWatchDog->MicaWatchDogSeverity('WARNING'));
      return $raw_data = array(
        'code' => $e->getCode(),
        'message' => $e->getMessage(),
      );
    }

  }
}
