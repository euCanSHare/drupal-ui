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
 * Mica Files module file
 */

/**
 * Download the attachments.
 *
 * @param string $entity_type
 *   The entity type containing attachments.
 * @param string $entity_id
 *   The entity id.
 * @param string $file_resource_id
 *   The file resource id.
 */
function obiba_mica_files_download_attachment($entity_id, $entity_type, $file_name) {
  _obiba_mica_files_download_attachment($entity_id, $entity_type, $_POST['file_path'], $file_name, FALSE);
}

function obiba_mica_files_get_file() {
  $parameters = drupal_get_query_parameters();
  $files_resources = new DrupalMicaFilesResource();
  $files = $files_resources->getFile($parameters['path'], !empty($parameters['keyToken']) ? $parameters['keyToken']:NULL);
  drupal_json_output(json_decode($files));
}

function obiba_mica_files_search_files() {
  $query_params = drupal_get_query_parameters();
  $mica_file = new DrupalMicaFilesResource();
  $path = $query_params['path'];
  unset($query_params['path']);
  drupal_json_output(json_decode($mica_file->searchFiles($path, $query_params)));
}

function  obiba_mica_file_download() {
  $query_parameters = drupal_get_query_parameters();

  $full_path = $query_parameters['path'];

  $file_path = substr($full_path, 0, strrpos($full_path, '/'));

  $file_name = str_replace('/', '', str_replace($file_path, '', $full_path));
  
  _obiba_mica_files_download_attachment(NULL, NULL, $file_path, $file_name,
   empty($query_parameters['inline']) ? 'false' : $query_parameters['inline'],
   !empty($query_parameters['keyToken']) ? $query_parameters['keyToken']: NULL);
}

/**
 * Download the attachments.
 *
 * @param string $entity_type
 *   The entity type containing attachments.
 * @param string $entity_id
 *   The entity id.
 * @param string $file_resource_id
 *   The file resource id.
 */
function _obiba_mica_files_download_attachment($entity_id, $entity_type, $file_path, $file_name, $inline, $key_token = NULL) {
  $mica_file = new DrupalMicaFilesResource();
  $raw_data = $mica_file->downloadAttachmentFile($file_path, $file_name, $inline, $key_token);
  if (!empty($raw_data) && empty($raw_data['code'])) {
    drupal_add_http_header('Content-Type',
      $raw_data['raw_header_array']['Content-Type']);
    drupal_add_http_header('Content-Disposition',
      $raw_data['raw_header_array']['Content-Disposition']);
    ob_clean();
    print $raw_data['data'];
    exit;
  }
  else {
    drupal_set_message(t('An error occurred downloading file,
      server response code : @code, Server message: "@message"',
      array(
        '@code' => $raw_data['code'],
        '@message' => $raw_data['message'],
      )
    ),
      'error');

    if (!empty($entity_type) && !empty($entity_id)) {
      drupal_goto('mica/' . $entity_type . '/' . $entity_id);
    }
  }
}
