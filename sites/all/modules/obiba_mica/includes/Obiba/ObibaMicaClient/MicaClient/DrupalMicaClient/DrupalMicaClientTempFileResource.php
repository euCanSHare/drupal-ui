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
 * TempFile resource class used to communicate with backend server
 */
namespace Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient;

use Obiba\ObibaMicaClient\MicaCache as MicaCache;
use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;
use Obiba\ObibaMicaClient\MicaWatchDog as MicaWatchDog;

/**
 * Class MicaDataAccessRequest
 */
class DrupalMicaTempFileResource extends MicaClient {
  const FILES_WS_URL = '/files/temp';
  const FILE_WS_URL = '/files/temp/{id}';
public $method;
  /**
   * Instance initialisation.
   *
   * @param string $mica_url
   *   The mica server url.
   * @param string $method
   *   THe method to query the server.
   */
  public function __construct($mica_url = NULL, $method = 'METHOD_POST') {
    parent::__construct($mica_url,
      new MicaCache\MicaDrupalClientCache(),
      new MicaConfig\MicaDrupalConfig(),
      new MicaWatchDog\MicaDrupalClientWatchDog());
    $this->method = $method;
  }

  /**
   * Upload file to mica server.
   *
   * @param array $file
   *   The http $_FILE Variable to send to server.
   *
   * @return array
   *   The data server response.
   */
  public function uploadFile(array $file) {
    if(empty($file)){
      $this->MicaClientAddHttpHeader('Status', 500 . ' ' . trim('global.server-error'), TRUE);
      watchdog('Mica Client','Error uploading the files Code : @code, Message:"@message"', array(
        '@code' => '0',
        '@message' => "UNKNOWN_UPLOAD_ERROR",
      ), WATCHDOG_ERROR);
      return array('data' => array('code' => 500, 'messageTemplate' => trim('server.error.file.upload'), 'status' => 500));
    }

    if(!empty($file['file']['error']) && $file['file']['error'] !== UPLOAD_ERR_OK){
      $this->MicaClientAddHttpHeader('Status', 500 . ' ' . trim('global.server-error'), TRUE);
      watchdog('Mica Client','Error uploading the files Code : @code, Message:"@message"', array(
        '@code' => $file['file']['error'],
        '@message' => $this->fileErrorMessage($file['file']['error']),
      ), WATCHDOG_ERROR);
      return array('data' => array('code' => 500, 'messageTemplate' => trim('server.error.file.upload'), 'status' => 500, 'arguments' => array($file['file']['name'])));
    }

    $curl_handle = $this->initializeCurl($file);
    $result = curl_exec($curl_handle);
    $http_code = curl_getinfo($curl_handle, CURLINFO_HTTP_CODE);
    $errors = $this->getErrors($http_code, $result);

    if (!empty($errors)) {
      return $errors;
    }

    if (preg_match('/(?<=files\/temp\/).*/', $result, $group)) {
      $match = $group[0];
    }

    curl_close($curl_handle);

    $headers = $this->getHeaders($result);

    if (!empty($headers) && !empty($headers['Location'])) {
      $this->MicaClientAddHttpHeader('Location', $headers['Location'][0]);
    }

    $this->MicaClientAddHttpHeader('Status', $http_code);

    return array('code' => $http_code, 'message' => trim($match));
  }

  /**
   * Upload Files errors map on $_FILES
   *
   * @param $error_code
   *
   * @return $error_detail
   *
   */
  public function fileErrorMessage($error_code = 0){
    if($error_code === UPLOAD_ERR_OK){
      return FALSE;
    }
    switch ($error_code){
      case 1:
        return "The uploaded file exceeds the upload_max_filesize directive in php.ini.";
      case 2:
        return "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.";
      case 3:
        return "The uploaded file was only partially uploaded.";
      case 4:
        return "No file was uploaded.";
      case 6:
        return "Missing a temporary folder. Introduced in PHP 5.0.3.";
      case 7:
        return "Failed to write file to disk. Introduced in PHP 5.1.0.";
      case 8:
        return "A PHP extension stopped the file upload.";
      default :
        return "UNKNOWN_UPLOAD_ERROR";
    }
  }

  /**
   * Resource to get temp file resource.
   *
   * @param string $id_file
   *   The file id.
   *
   * @return array
   *   The data server response.
   */
  public function getFile($id_file) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . preg_replace('/\\{id\\}/', $id_file, self::FILE_WS_URL, 1);
    $request = $this->getMicaHttpClientRequest($url_requests, array(
      'method' => $this->getMicaHttpClientStaticMethod($this->method),
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }

  /**
   * Resource to get temp file resource.
   *
   * @param string $id_file
   *   The file id.
   *
   * @return array
   *   The data server response.
   */
  public function deleteFile($id_file) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . preg_replace('/\\{id\\}/', $id_file, self::FILE_WS_URL, 1);

    $request = $this->getMicaHttpClientRequest($url_requests,
      array('method' => $this->getMicaHttpClientStaticMethod($this->method)));

    $this->MicaClientAddHttpHeader('Status', $this->getLastResponseStatusCode());
    return array('Status' => $request->statusCode);
  }

  /**
   * Sets up cURL and return a $resource
   * @param $file
   * @return resource
   */
  private function initializeCurl(array $file) {
    $file_info = new \finfo(FILEINFO_MIME);
    $mime_file = $file_info->file($file['file']['tmp_name']);
    $cfile = new \CurlFile($file['file']['tmp_name'], $mime_file, $file['file']['name']);
    $data_file = array('file' => $cfile);
    $url = $this->micaUrl . self::FILES_WS_URL;
    $curl_handle = curl_init();
    $header = $this->authorizationHeader(array());
    curl_setopt($curl_handle, CURLOPT_URL, $url);
    curl_setopt($curl_handle, CURLOPT_HEADER, TRUE);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl_handle, CURLINFO_HEADER_OUT, TRUE);
    curl_setopt($curl_handle, CURLOPT_POST, 1);

    curl_setopt($curl_handle, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($curl_handle, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($curl_handle, CURLOPT_POSTFIELDS, $data_file);
    curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array(
      'Accept' => $this::HEADER_JSON,
      'Content-Type' => 'multipart/form-data',
    ));

    if (!empty($header['Cookie'])) {
      foreach ($header['Cookie'] as $cookie) {
        curl_setopt($curl_handle, CURLOPT_COOKIE, $cookie);
      }
    }

    return $curl_handle;
  }

  /**
   * Verifies the status code and if any errors are found, returns the error data
   *
   * @param $http_code
   * @param $result
   * @return array|null
   */
  private function getErrors($http_code, $result) {
    if ($http_code != 201 && preg_match_all('/(?<=HTTP\/1\.1).*/', $result, $error_meesage)) {
      foreach ($error_meesage[0] as $message) {
        if (!preg_match('/(?<= 100 ).*/', $message, $code)) {
          $this->drupalWatchDog->MicaWatchDog('Mica Client',
            'Connection to server fail,  Error serve code : @code, message: @message',
            array(
              '@code' => $http_code,
              '@message' => $message,
            ), $this->drupalWatchDog->MicaWatchDogSeverity('WARNING'));
          return array('code' => $http_code, 'message' => $message);
        }
      }
    }

    return NULL;
  }

  private function execute($request) {
    $client = $this->client();
    try {
      $response = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      return json_decode($response);
    }
    catch (\HttpClientException $e) {
      $this->drupalWatchDog->MicaWatchDog('Mica Client',
        'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), $this->drupalWatchDog->MicaWatchDogSeverity('WARNING'));

      $this->MicaClientAddHttpHeader('Status', $e->getCode());
      return empty($client->lastResponse->body) ? FALSE : json_decode($client->lastResponse->body);
    }

  }

}
