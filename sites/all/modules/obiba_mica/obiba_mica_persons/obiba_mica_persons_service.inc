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
 * Mica Persons module file
 */

/**
 * Get the person list by studies id (id1+id2+id3...).
 *
 * @param string $entity_id
 * @param string $entity_query
 */
function obiba_mica_persons_list($entities_id) {
  $entities_id = str_replace('+', '%2B', $entities_id);
  $entities_id = json_decode($entities_id);
  $query_person = empty($entities_id->studiesId) ? '' : "studyMemberships.parentId:(" . implode('+OR+', $entities_id->studiesId) . ")";
  if (!empty($entities_id->networksId)) {
    if (!empty($query_person)) {
      $query_person .= '+OR+';
    }
    $query_person .= "networkMemberships.parentId:(" . implode('+OR+', $entities_id->networksId) . ")";
  }
  $persons_resources = new DrupalMicaPersonsResource();
  $persons = $persons_resources->search($query_person);

  if (!empty($persons->persons)) {
    $localize = obiba_mica_commons_mica_server_localisation();

    foreach ($persons->persons as &$person) {
      foreach ($person->studyMemberships as &$membership) {
        $membership->role = $localize->getTranslation('contact.label-plurial.' . $membership->role);
      }
      foreach ($person->networkMemberships as &$membership) {
        $membership->role = $localize->getTranslation('contact.label-plurial.' . $membership->role);
      }
    }
  }

  drupal_json_output(array(
    "recordsTotal" => $persons->total,
    "data" => !empty($persons->persons) ? $persons->persons : array()
  ));
}

/**
 * Download a csv file of the person list by studies id (id1+id2+id3...).
 *
 * @param string $studies_id
 */
function obiba_mica_persons_list_csv_download($entities_id) {
  $entities_id = str_replace('+', '%2B', $entities_id);
  $entities_id = json_decode($entities_id);
  $query_person = empty($entities_id->studiesId) ? '' : "studyMemberships.parentId:(" . implode('+OR+', $entities_id->studiesId) . ")";
  if (!empty($entities_id->networksId)) {
    if (!empty($query_person)) {
      $query_person .= '+OR+';
    }
    $query_person .= "networkMemberships.parentId:(" . implode('+OR+', $entities_id->networksId) . ")";
  }
  $persons_resources = new DrupalMicaPersonsResource();
  $response = $persons_resources->download($query_person);
  if (!empty($response)) {
    $headers = $persons_resources->getLastResponseHeaders();
    drupal_add_http_header('Content-Disposition', $headers['Content-Disposition'][0]);
    ob_clean();
    $csv_response = $response->body;
    print $csv_response;
    exit;
  }
}
