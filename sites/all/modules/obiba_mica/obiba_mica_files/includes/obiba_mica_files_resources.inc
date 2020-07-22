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
 * MicaFilesResource class
 */


/**
 * Class MicaStudyResource
 */
class DrupalMicaFilesResource extends DrupalMicaClientResource {

  const POPULATION = 'population';
  const DCE = 'data-collection-event';

  public function __construct($mica_url = NULL) {
    parent::__construct($mica_url);
  }

  /**
   * Get attachments by path resource.
   *
   * @param $entity_type
   *  study/network/population/data-collection-event/dataset
   * @param  $entity_id
   *  The entity Id
   *
   * @return array
   */
  public function getFile($path, $token_key = NULL) {
    $this->setLastResponse(NULL);
    $resource_query = '/file' . $this->encode_path_parts($path);
    if(!empty($token_key)){
      $resource_query = '/draft/file' . $this->encode_path_parts($path) . '?key=' . $token_key;
    }
    $cached_file = $this->drupalCache->MicaGetCache($resource_query);
    if (!empty($cached_file)) {
      return $cached_file;
    }
    else {
    $url = $this->micaUrl . $resource_query;
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));
    $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $data = !empty($data) ? $data : NULL;
        $this->drupalCache->MicaSetCache($resource_query, $data);
        return $data;
      } catch (HttpClientException $e) {
        watchdog('Mica Client', 'Parsing attachments, Connection to server fail,
      Error serve code : @code, message: @message',
          array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage(),
          ), WATCHDOG_WARNING);
        if(obiba_mica_commons_is_ajax()){
          drupal_add_http_header('Status', $e->getCode());
        }
        return json_encode(array(
          'code' => $e->getCode(),
          'message' => $e->getMessage(),
        ));
      }
    }
  }

  public function searchFiles($path, $query_params) {
    $this->setLastResponse(NULL);
    $resource_query = '/files-search' . $this->encode_path_parts($path) . '?' . http_build_query($query_params);
    $url = $this->micaUrl . $resource_query;
    $cached_result_files = $this->drupalCache->MicaGetCache($resource_query);
    if (!empty($cached_result_files)) {
      return $cached_result_files;
    }
    else {
      $request = new HttpClientRequest($url, array(
        'method' => HttpClientRequest::METHOD_GET,
        'headers' => $this->authorizationHeader(array(
            'Accept' => array(parent::HEADER_JSON),
          )
        ),
      ));

      $client = $this->client();
      try {
        $data = $client->execute($request);
        $this->setLastResponse($client->lastResponse);
        $data = !empty($data) ? $data : NULL;
        $this->drupalCache->MicaSetCache($resource_query, $data);
        return $data;
      } catch (HttpClientException $e) {
        watchdog('Mica Client', 'Parsing attachments, Connection to server fail,
      Error serve code : @code, message: @message',
          array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage(),
          ), WATCHDOG_WARNING);
        drupal_add_http_header('Status', $e->getCode());
        return json_encode(array(
          'code' => $e->getCode(),
          'message' => $e->getMessage(),
        ));
      }
    }
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
   * @param boolean $inline
   *   flag to indicate Content-Disposition to be inline
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
  public function downloadAttachmentFile($file_path, $file_name, $inline, $key_token = NULL) {
    $url = sprintf("%s/file-dl%s/%s?inline=%s",
      $this->micaUrl,
      $this->encode_path_parts($file_path),
      rawurlencode($file_name),
      $inline);
  if(!empty($key_token)){
    $url = sprintf("%s/draft/file-dl%s/%s?inline=%s&key=%s",
      $this->micaUrl,
      $this->encode_path_parts($file_path),
      rawurlencode($file_name),
      $inline,
      $key_token
      );
  }
    $request = new HttpClientRequest($url, array(
      'method' => HttpClientRequest::METHOD_GET,
      'headers' => self::authorizationHeader(array(
          'Accept' => array(
            'text/html',
            'application/xhtml+xml',
            'application/xml;q=0.9',
            'image/webp',
            '*/*;q=0.8'
          ),
        )
      ),
    ));

    $client = $this->client();

    try {
      $data = $client->execute($request);
      $this->setLastResponse($client->lastResponse);
      $file_name = parent::getPropertyValueFromHeaderArray(parent::parseHeaders($client->lastResponse->headers),
        'filename',
        'Content-Disposition'
      );
      $raw_data = array(
        'extension' => parent::getFileExtension($file_name),
        'data' => $data,
        'filename' => $file_name,
        'raw_header_array' => parent::parseHeaders($client->lastResponse->headers),
      );
      return $raw_data;
    } catch (HttpClientException $e) {
      watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
        array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage(),
        ), WATCHDOG_WARNING);
      return $raw_data = array(
        'code' => $e->getCode(),
        'message' => $e->getMessage(),
      );
    }

  }

  private function encode_path_parts($path) {
    return implode('/', array_map('rawurlencode', explode('/', $path)));
  }

  public function hasFiles($filesTree){
  if(!empty($filesTree->children)){
      foreach($filesTree->children as $child){
            if($child->type == "FILE" && $child->size > 0){
              return TRUE;
            }
        elseif($child->type == "FOLDER" && ($child->name != 'population' && $child->name != 'data-collection-event')){
          $subFolder = json_decode($this->getFile($child->path));
          if($this->hasFiles($subFolder) === TRUE){
            return TRUE;
          }
        }
      }
  }
    return FALSE;
  }
}
