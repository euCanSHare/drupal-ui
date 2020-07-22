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
 * Class MicaDataAccessRequestComment
 */
class MicaDataAccessRequestComment extends DrupalMicaDataAccessRequestResources {

  const RESOURCE_PATH = '%s/%s/comment/%s';

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
   * Save the comment.
   *
   * @param string $request_id
   *   The data access request id.
   * @param string $comment_id
   *   The comment id.
   * @param string $comment
   *   The content text content.
   * @param string $resource
   *   The path server resource.
   *
   * @return array
   *   The data server response.
   */
  public function saveComment($request_id, $comment_id, $comment, $resource) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . sprintf(self::RESOURCE_PATH, $resource, $request_id, $comment_id);
    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_PUT,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
          'Content-Type' => array(parent::HEADER_TEXT),
        )
      ),
      'data' => $comment,
    ));

    return $this->execute($request);
  }

  /**
   * Save the comment.
   *
   * @param string $request_id
   *   The data access request id.
   * @param string $comment_id
   *   The comment id.
   * @param string $resource
   *   The path server resource.
   *
   * @return array
   *   The data server response.
   */
  public function deleteComment($request_id, $comment_id, $resource) {
    $this->setLastResponse(NULL);
    $url_requests = $this->micaUrl . sprintf(self::RESOURCE_PATH, $resource, $request_id, $comment_id);
    $request = new HttpClientRequest($url_requests, array(
      'method' => HttpClientRequest::METHOD_DELETE,
      'headers' => $this->authorizationHeader(array(
          'Accept' => array(parent::HEADER_JSON),
        )
      ),
    ));

    return $this->execute($request);
  }
}
