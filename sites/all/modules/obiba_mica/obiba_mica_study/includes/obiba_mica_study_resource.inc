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

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;
use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient\DrupalMicaClientResourcePathHelper as ResourcesWsPath;

/**
 * Class MicaStudyResource
 */
class DrupalMicaStudyResource extends DrupalMicaClientResource {
  const STUDIES = 'mica/study';
  const HARMONIZATION_STUDY = 'harmonization-study';
  const HARMONIZATION_STUDY_LINK = 'mica/harmonization-study/{id}';

  const ALL_STUDIES = 'studies';
  const INDIVIDUAL_STUDY = 'individual-study';
  const INDIVIDUAL_STUDY_LINK = 'mica/individual-study/{id}';

  public function __construct($mica_url = NULL) {
    parent::__construct($mica_url);
  }

  public static function mapTypeToClassName($type) {
    switch ($type) {
      case self::INDIVIDUAL_STUDY:
        return 'Study';
      case self::HARMONIZATION_STUDY:
        return 'HarmonizationStudy';
      case self::ALL_STUDIES:
        return self::ALL_STUDIES;
    }

    watchdog('Mica Client', 'Invalid study type ' . $type, WATCHDOG_WARNING);
    return $type;
  }

  /**
   * Get the list of studies.
   *
   * @param null $query .
   * @param int $from .
   * @param int $limit .
   * @param null $sort field name to sort by.
   * @param null $order "asc" or "desc".
   * @param null $studies_type "harmonization_studies".
   *
   * @param null $fields
   * @return array|mixed
   */
  public function getStudies($query = NULL, $from = 0, $limit = 5, $sort = NULL, $order = NULL, $studies_type = NULL, $fields = NULL) {
    global $language;

    $studies_type = (!empty($studies_type)) ? $studies_type : 'studies';
    $this->setLastResponse(NULL);
    $resource_query = $this->generateRqlQuery($query, $from, $limit, $sort, $order, $language, $studies_type, $fields);

    $cached_studies = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cached_studies)) {
      return $cached_studies;
    }
    else {
      $url_studies = $this->micaUrl . $resource_query;
      $request = new HttpClientRequest($url_studies, array(
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
        $return_studies = !empty($data) ? new DrupalMicaClient\StudyJoinResponseWrapper(json_decode($data)) : NULL;
        $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $return_studies);
        return $return_studies;
      } catch (HttpClientException $e) {
        watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message',
          array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage()
          ), WATCHDOG_WARNING);
        return array();
      }
    }
  }

  /**
   * Get a study by its ID.
   *
   * @param $study_id
   *
   * @return array
   */
  public function getStudy($study_id, $token_key = NULL, $study_type = NULL) {
    $cached_study = NULL;
    if($study_type == DrupalMicaStudyResource::HARMONIZATION_STUDY){
      $resource_path['pub'] = ResourcesWsPath::WS_HARMONIZATION_STUDY;
      $resource_path['draft'] = ResourcesWsPath::WS_HARMONIZATION_DRAFT_STUDY;
    }
    else{
      $resource_path['pub'] = ResourcesWsPath::WS_COLLECTION_STUDY;
      $resource_path['draft'] = ResourcesWsPath::WS_COLLECTION_DRAFT_STUDY;
    }
    $resource_query = ResourcesWsPath::getResourcePath($resource_path['pub'], array(rawurlencode($study_id)));
    if(empty($token_key)) {
      $resource_query .= '?participatingStudies=true';
    } else {
      $resource_query =
        ResourcesWsPath::getResourcePath(
          $resource_path['draft'],
          array(rawurlencode($study_id),  $token_key)
        ) . '&participatingStudies=true';
    }
    global $language;
    if ($language){
      // Omit to query with lang parameters to receive study Dto that will be translated using internal drupal mechanism.
      // $resource_query .= '?locale=' . $language->language;
    }
    $this->setLastResponse(NULL);
    $cached_study = $this->drupalCache->MicaGetCache(__FUNCTION__ . $resource_query);
    if (!empty($cached_study)) {
      return $cached_study;
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
        $result_study = $data ? json_decode($data) : NULL;

        if (!empty($result_study)) {
          $this->updateModel($result_study);
          if (!empty($result_study->populations)) {
            foreach ($result_study->populations as $population) {
              $this->updateModel($population);
              if (!empty($population->dataCollectionEvents)) {
                foreach ($population->dataCollectionEvents as $dce) {
                  $this->updateModel($dce);
                }
              }
            }
          }
          $this->drupalCache->MicaSetCache(__FUNCTION__ . $resource_query, $result_study);
          return $result_study;
        }
      } catch (HttpClientException $e) {
        watchdog('Mica Client', 'Connection to server fail,  Error serve code : @code, message: @message, called function : @function',
          array(
            '@code' => $e->getCode(),
            '@message' => $e->getMessage(),
            '@function' => __FUNCTION__
          ), WATCHDOG_WARNING);
        $message_parameters['message'] = 'Connection to server fail,  Error serve code : @code, message: @message';
        $message_parameters['placeholders'] = array(
          '@code' => $e->getCode(),
          '@message' => $e->getMessage()
        );
        $message_parameters['severity'] = 'error';
        if ($e->getCode() == 500 || $e->getCode() == 503 || $e->getCode() == 0) {
          DrupalMicaClientResource::DrupalMicaErrorHandler(TRUE, $message_parameters);
          throw $e;
        }
        drupal_set_message(t($message_parameters['message'],$message_parameters['placeholders']),  $message_parameters['severity']);
      }
    }
  }

  private function updateModel($obj) {
    if (!empty($obj->content)) {
      $obj->model = json_decode($obj->content);
    }
    else {
      $obj->model = new stdClass();
    }
  }

  /**
   * @param $query
   * @param $from
   * @param $limit
   * @param $sort
   * @param $order
   * @param $language
   * @param $studies_type
   * @return string
   */
  private function generateRqlQuery($query, $from, $limit, $sort, $order, $language, $studies_type = NULL, $fields = NULL) {
    switch ($studies_type){
      case self::HARMONIZATION_STUDY :
        $class_name = 'HarmonizationStudy';
        break;
      case self::INDIVIDUAL_STUDY :
        $class_name = 'Study';
        break;
      default:
        $class_name = '(Study,HarmonizationStudy)';
        break;
    }

    $study_rql_queries = array();

    $from = empty($from) ? '0' : $from;
    $limit = empty($limit) ? '5' : $limit;

    array_push($study_rql_queries, DrupalMicaClient\RqlQueryBuilder::limit_query($from, $limit));

    if (!empty($query) && !empty($class_name)) {
      array_push($study_rql_queries,
        DrupalMicaClient\RqlQueryBuilder::and_query(
          DrupalMicaClient\RqlQueryBuilder::match_query($query, "Mica_study",array("name", "acronym", "objectives")),
          DrupalMicaClient\RqlQueryBuilder::className_query("Mica_study", $class_name)
        )
      );
    } elseif (!empty($query) && empty($class_name)) {
      array_push(
        $study_rql_queries,
        DrupalMicaClient\RqlQueryBuilder::match_query(
          $query,
          "Mica_study",
          array("name", "acronym", "objectives")
        )
      );
    } elseif (empty($query) && !empty($class_name)) {
      array_push($study_rql_queries, DrupalMicaClient\RqlQueryBuilder::className_query("Mica_study", $class_name));
    } else {
      array_push($study_rql_queries, DrupalMicaClient\RqlQueryBuilder::exists_query("Mica_study", "id"));
    }

    array_push(
      $study_rql_queries,
      DrupalMicaClient\RqlQueryBuilder::sort_query(
        empty($order) ? '' : ($order == 'desc' ? '-' : ''),
        empty($sort) ? "name" : $sort)
    );

    if (NULL != $fields) {
      array_push(
        $study_rql_queries,
        DrupalMicaClient\RqlQueryBuilder::fields_query($fields)
      );
    }

    $params = DrupalMicaClient\RqlQueryBuilder::study_queries($study_rql_queries);

    $params .= ",locale($language->language)";
    $resource_query = ResourcesWsPath::getResourcePath(ResourcesWsPath::WS_STUDIES_SEARCH, array($params));
    return $resource_query;
  }

  /**
   * The study detail url.
   *
   * @param string $id
   *   Study id.
   *
   * @return string
   *   The url of the study detail.
   */
  public static function study($id) {
    return preg_replace('/\\{id\\}/', $id, self::INDIVIDUAL_STUDY_LINK, 1);
  }

  /**
   * Study list item.
   *
   * @param object $study
   *   The study wrapper.
   *
   * @return string
   *   Formatted list.
   */
  public static function studyListItem($study) {
    return MicaClientAnchorHelper::listItem($study, self::study($study->id));
  }

  /**
   * Returns the url to the draft study document
   *
   * @param string
   *  Study $id
   * @return string
   */
  public static function study_draft_url($id, $type = self::INDIVIDUAL_STUDY) {
    return sprintf("%s/#/%s/%s", MicaClientPathProvider::get_mica_url(), $type, $id);
  }

  /**
   * The study detail url.
   *
   * @param object $study
   *   Study wrapper.
   *
   * @return string
   *   The url of the study detail.
   */
  public static function anchorStudy($study) {
    $name = obiba_mica_commons_get_localized_field($study, 'acronym');
    $study_id = !empty($study->studyId) ? $study->studyId : $study->id;
    $Link_study = (!empty($study->studyResourcePath) && $study->studyResourcePath == self::HARMONIZATION_STUDY) ?
      DrupalMicaStudyResource::harmoStudy($study_id) : self::study($study_id);
    return !empty($study->published) ? l($name, $Link_study, array()) : $name;
  }

  /**
   * The target of a population dce modal.
   *
   * @param $study_id
   * @param $population_id
   * @param $dce
   * @return mixed
   */
  public static function studyPopulationDceModalTarget($study_id, $population_id, $dce) {
    return MicaClientPathHelpers::normalizeModalTarget($study_id . ':' . $population_id . ':' .
      (is_string($dce) ? $dce : $dce->id), TRUE);
  }

  /**
   * The DCE anchor for a study.
   *
   * @param string $study_id
   *   The study id.
   * @param string $population_id
   *   The population id.
   * @param object $dce
   *   The dce wrapper.
   *
   * @return string
   *   The anchor link.
   */
  public static function studyPopulationDceModal($study_id, $population_id, $dce) {
    return l(obiba_mica_commons_get_localized_field($dce, 'name'), '#', array(
      'external' => TRUE,
      'attributes' => array(
        'data-toggle' => 'modal',
        'data-dceId' => self::studyPopulationDceModalTarget($study_id, $population_id, $dce),
        'data-target' => '#dce-modal'
      ),
    ));
  }

  /**
   * The population detail url.
   *
   * @param object $population
   *   Population wrapper.
   *
   * @return string
   *   The url of the population detail.
   */
  public static function studyPopulationModal($population) {
    $link = l(obiba_mica_commons_get_localized_field($population, 'name'), '#', array(
      'external' => TRUE,
      'attributes' => array(
        'data-toggle' => 'modal',
        'data-target' => MicaClientPathHelpers::normalizeModalTarget('#population-' . $population->id),
      ),
    ));
    return $link;
  }

  /**
   * The study detail url.
   *
   * @param string $id
   *   Study id.
   *
   * @return string
   *   The url of the study detail.
   */
  public static function harmoStudy($id) {
    return preg_replace('/\\{id\\}/', $id, self::HARMONIZATION_STUDY_LINK, 1);
  }

  /**
   * Study list item.
   *
   * @param object $study
   *   The study wrapper.
   *
   * @return string
   *   Formatted list.
   */
  public static function harmoStudyListItem($study) {
    return MicaClientAnchorHelper::listItem($study, self::harmoStudy($study->id));
  }

}
