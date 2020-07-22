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
 * Class definition path server resources.
 */


use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;

/**
 * Mica client path helper Class.
 **/
class MicaClientPathHelpers {

  /**
   * Replace the + on the url.
   *
   * @param string $path
   *   The url.
   *
   * @return string
   *   Transformed url.
   */
  public static function replacePlusInUrl($path) {
    return preg_replace('/\+/', '-', $path, 1);
  }

  /**
   * Normalized the modal target to make a jQuery-safe reference.
   *
   * @param $target
   * @param $isDce
   * @return mixed
   */
  public static function normalizeModalTarget($target, $isDce = NULL) {
    return self::replacePlusInUrl(str_replace(' ', '_',
      $isDce ? $target : preg_replace('/\./', '___', $target)));
  }
}

class MicaClientPathProvider {
  const NETWORKS = 'mica/network';
  const NETWORK = 'mica/network/{id}';
  const SEARCH = 'mica/search';
  const COVERAGE = 'mica/ng/coverage';
  const DATA_ACCESS = 'mica/data_access';
  const DATA_ACCESS_REQUEST = 'mica/data_access/request';
  const DATA_ACCESS_HOME = 'mica/data_access/home';
  const DATA_ACCESS_LIST = 'mica/data_access/requests';
  const DATA_ACCESS_USERS_LIST = 'mica/data_access/users';
  const DATA_ACCESS_PROJECTS = 'mica/data_access/projects';
  const PROJECT = 'mica/project/{id}';
  const RESEARCH_PROJECT = 'mica/research';
  const RESEARCH_PROJECT_APPROVED = 'mica/research/projects';
  const AGATE_REGISTER = 'agate/register';
  const AGATE_PROFILE = 'agate/user/profile';
  const REPOSITORY_SEARCH = 'mica/repository';
  const PAGE_STUDIES_LIST = 'mica/study';
  const PAGE_NETWORKS_LIST = 'mica/networks/list';
  const ANALYSIS = 'mica/analysis';
  const SETS = 'mica/sets';
  const CART = 'mica/cart';

  /**
   * The project detail url or link if no text is present.
   * 
   * @param $id
   * @param $text
   * @return mixed
   */
  public static function project($id, $text = NULL) {
    if (empty($text)) {
      global $base_url;
      return $base_url . '/' . preg_replace('/\\{id\\}/', $id, self::PROJECT, 1);
    } else {
      return l($text, preg_replace('/\\{id\\}/', $id, self::PROJECT, 1));
    }
  }

  /**
   * The data access request detail link
   * 
   * @param $id
   * @return mixed
   */
  public static function data_access_request($id) {
    return l($id, MicaClientPathProvider::DATA_ACCESS_REQUEST, array('fragment' => '/data-access-request/' . $id));
  }
  
  /**
   * The network detail url.
   *
   * @param string $id
   *   Network id.
   *
   * @return string
   *   The url of the network detail.
   */
  public static function network($id) {
    return preg_replace('/\\{id\\}/', $id, self::NETWORK, 1);
  }

  /**
   * Returns the url to the draft network document
   *
   * @param string
   *  Study $id
   * @return string
   */
  public static function network_draft_url($id) {
    return sprintf("%s/#/network/%s", MicaClientPathProvider::get_mica_url(), $id);
  }

  /**
   * Get the public URL if defined in the server otherwise get the mica url as defined in drupal.
   *
   * @return null
   */
  public static function get_mica_url() {
    $mica_config = new DrupalMicaClient\MicaClientConfigResource();
    $url = $mica_config->getPublicURL();
    return empty($url) ? variable_get_value('mica_url') : $url;
  }

}

class MicaClientAnchorHelper {
  const DEFAULT_PRIMARY_BUTTON_CLASSES = 'btn highlight btn btn-primary';

  /**
   * Truncate a given long string.
   *
   * @param string $text
   *   The text link.
   * @param string $paragraph
   *   The paragraph to ellipses.
   * @param string $url
   *   The url to complete paragraph.
   * @param int $max_length
   *   The max length of paragraph to display.
   *
   * @return string
   *   Truncated text.
   */
  public static function ellipses($text, $paragraph, $url, $max_length = 300) {
    if (empty($paragraph)) {
      return '';
    }

    if (drupal_strlen($paragraph) >= $max_length) {
      return text_summary(strip_tags(obiba_mica_commons_markdown($paragraph)), 'html', $max_length) . '... ' . l($text, $url);
    }

    return $paragraph;
  }

  /**
   * Get link to list of variables by dataset id.
   *
   * @param string $text
   *   Text link.
   * @param string $dataset_id
   *   The dataset id.
   * @param array $attributes
   *   A set of link attributes.
   * @param string $supplementary_query
   *   A supplementary query.
   *
   * @return string
   *   The anchor link.
   */
  public static function datasetVariables($text, $dataset_id, array $attributes = array(), $supplementary_query = NULL) {
    $query = '';
    if (!empty($supplementary_query)) {
      $query .= ',' . $supplementary_query;
    }
    return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
      empty($text) ? variable_get_value('variables_search_label') : $text,
      $attributes,
      array(
        'type' => 'variables',
        'query' => 'dataset(in(Mica_dataset.id,' . $dataset_id . '))' . $query,
        'display' => 'list'
      ));
  }

  /**
   * Study variable anchor link.
   *
   * @param string $text
   *   The text anchor.
   * @param string $study_id
   *   The study id.
   * @param array $attributes
   * @param string $supplementary_query
   * @return string The anchor link.
   * The anchor link.
   */
  public static function studyVariables($text, $study_id, array $attributes = array(), $supplementary_query = NULL) {
      $query = 'study(in(Mica_study.id,' . $study_id . '))';
      if (!empty($supplementary_query)) {
        $query .= ',' . $supplementary_query;
      }
      return ObibaSearchResources::repositoryAnchor(
        MicaClientPathProvider::REPOSITORY_SEARCH,
        empty($text) ? variable_get_value('variables_search_label') : $text,
        $attributes,
        array(
          'type' => 'variables',
          'query' => $query,
          'display' => 'list'
        ));
  }

  /**
   * Dce study variable anchor link.
   *
   * @param string $text
   *   The text anchor.
   * @param string $dce_id
   *   The dce id.
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function dceStudyVariables($text, $dce_id, $is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(
        MicaClientPathProvider::REPOSITORY_SEARCH,
        empty($text) ? variable_get_value('variables_search_label') : $text,
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'type' => 'variables',
          'query' => 'variable(in(Mica_variable.dceIds,' . urlencode($dce_id) . '))',
          'display' => 'list'
        ));
  }

  /**
   * Dce study coverage anchor link.
   *
   * @param string $dce_id
   *   The dce id.
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageDceStudy($dce_id, $is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(
        MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('variable_coverage_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'type' => 'variables',
          'query' => 'variable(in(Mica_variable.dceIds,' . urlencode($dce_id) . '))',
          'display' => 'coverage'
        ));
  }

  /**
   * Network list item.
   *
   * @param object $network
   *   The network wrapper.
   *
   * @return string
   *   Formatted list.
   */
  public static function networkListItem($network) {
    return self::listItem($network, MicaClientPathProvider::network($network->id));
  }

  /**
   * Network detail url.
   *
   * @param object $network
   *   The network wrapper.
   *
   * @return string
   *   Formatted list.
   */
  public static function network($network) {
    $name = obiba_mica_commons_get_localized_field($network, 'acronym');
    return !empty($network->published)?l($name, MicaClientPathProvider::network($network->id), array()):$name;
  }

  /**
   * Get link to networks by study id.
   *
   * @param string $text
   *   The test link.
   * @param string $study_id
   *   The study id.
   * @param string $css_class
   *   the affected css class.
   * @param null $test_ref
   *   reference used by UI tester
   * @return string The anchor link.
   * The anchor link.
   */
  public static function studyNetworks($text, $study_id, $css_class, $test_ref = NULL) {
      return ObibaSearchResources::repositoryAnchor(
        MicaClientPathProvider::REPOSITORY_SEARCH,
        $text,
        array(
          'class' => ($css_class ? $css_class : ''),
          'test-ref' => $test_ref),
        array(
          'type' => 'networks',
          'query' => 'network(in(Mica_network.studyIds,' . $study_id . '))',
          'display' => 'list'
        ));

  }

  /**
   * Get link to list of studies by networks id.
   *
   * @param string $text
   *   Text link.
   * @param string $network_id
   *   The network id.
   * @param array $attributes
   *   A set of link attributes.
   *
   * @return string
   *   The anchor link.
   */
  public static function networkStudies($text, $network_id, array $attributes = array(), $supplementary_query = NULL) {
    $query = 'network(in(Mica_network.id,' . $network_id . '))';
    if (!empty($supplementary_query)) {
      $query .= ',' . $supplementary_query;
    }

    return ObibaSearchResources::repositoryAnchor(
      MicaClientPathProvider::REPOSITORY_SEARCH,
      empty($text) ? variable_get_value('variables_search_label') : $text,
      $attributes,
      array(
        'type' => 'studies',
        'query' => $query,
        'display' => 'list'
      ));
  }

  /**
   * Get link to list of datasets by networks id.
   *
   * @param string $text
   *   Text link.
   * @param string $network_id
   *   The network id.
   *
   * @return string
   *   The anchor link.
   */
  public static function networkDatasets($text, $network_id, array $attributes = array()) {
      return ObibaSearchResources::repositoryAnchor(
        MicaClientPathProvider::REPOSITORY_SEARCH,
        empty($text) ? variable_get_value('variables_search_label') : $text,
        $attributes,
        array(
          'type' => 'datasets',
          'query' => 'network(in(Mica_network.id,' . $network_id . '))',
          'display' => 'list'
        ));
  }

  /**
   * Get link to list of variables by networks id.
   *
   * @param string $text
   *   Text link.
   * @param string $network_id
   *   The network id.
   * @param array $attributes
   *   A set of link attributes.
   * @param string $supplementary_query
   * @return string The anchor link.
   * The anchor link.
   */
  public static function networkVariables($text, $network_id, array $attributes = array(), $supplementary_query = NULL) {
      $query = 'network(in(Mica_network.id,' . $network_id . '))';
      if (!empty($supplementary_query)) {
        $query .= ',' . $supplementary_query;
      }
      return ObibaSearchResources::repositoryAnchor(
        MicaClientPathProvider::REPOSITORY_SEARCH,
        empty($text) ? variable_get_value('variables_search_label') : $text,
        $attributes,
        array(
          'type' => 'variables',
          'query' => $query,
          'display' => 'list'
        ));
  }

  /**
   * Get link to search networks.
   *
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function searchNetworks($is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('networks_search_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'type' => 'networks',
          'query' => 'network(exists(Mica_network.id))',
          'display' => 'list'
        ));
  }

  public static function dashboardNetworks($text, $class) {
    $query =
      DrupalMicaClient\RqlQueryBuilder::network_query(
        DrupalMicaClient\RqlQueryBuilder::exists_query('Mica_network', 'id')
      );

    return self::searchDocument($query, 'networks', $text, $class);
  }

  public static function dashboardStudies($text, $class) {
    $query =
      DrupalMicaClient\RqlQueryBuilder::study_query(
        DrupalMicaClient\RqlQueryBuilder::exists_query('Mica_study', 'id')
      );

    return self::searchDocument($query, 'studies', $text, $class);
  }

  public static function dashboardStudiesWithVariable($text, $class) {
    $query = array(
      DrupalMicaClient\RqlQueryBuilder::study_query(
        DrupalMicaClient\RqlQueryBuilder::className_query('Mica_study', 'Study')
      ),
      DrupalMicaClient\RqlQueryBuilder::variable_query(
        DrupalMicaClient\RqlQueryBuilder::in_query('Mica_variable', 'variableType', 'Collected')
      )
    );

    return self::searchDocument(join(',',$query), 'studies', $text, $class);
  }

  public static function dashboardVariables($text, $class) {
    $query =
      DrupalMicaClient\RqlQueryBuilder::variable_query(
        DrupalMicaClient\RqlQueryBuilder::exists_query('Mica_variable', 'name')
      );

    return self::searchDocument($query, 'studies', $text, $class);
  }

  private static function searchDocument($query, $type, $text, $class) {
    return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
      $text,
      array('class' => empty($class) ? '' : (is_array($class) ? join(' ', $class) : $class)),
      array(
        'type' => $type,
        'query' => $query,
        'display' => 'list'
      ));
  }

  /**
   * The network coverage anchor link.
   *
   * @param string $network_id
   *   The network id.
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageNetwork($network_id, $is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('variable_coverage_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'type' => 'networks',
          'query' => 'network(in(Mica_network.id,' . $network_id . '))',
          'display' => 'coverage',
          'bucket' => 'study'
        ));
  }

  /**
   * The networks coverage anchor link.
   *
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageNetworks($is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('variable_coverage_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'type' => 'networks',
          'query' => 'network(exists(Mica_network.id))',
          'display' => 'coverage'
        ));
  }

  /**
   * The dataset coverage anchor link.
   *
   * @param string $dataset_id
   *   The dataset id.
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageDataset($dataset_id, $is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('variable_coverage_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'type' => 'variables',
          'query' => 'dataset(in(Mica_dataset.id,' . $dataset_id . '))',
          'display' => 'coverage'
        ));
  }

  /**
   * Get link to list of studies by dataset id.
   *
   * @param string $text
   *   Text link.
   * @param string $dataset_id
   *   The dataset id.
   * @param array $attributes
   *   A set of link attributes.
   *
   * @return string
   *   The anchor link.
   */
  public static function datasetStudies($text, $dataset_id, array $attributes = array()) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        $text,
        $attributes,
        array(
          'type' => 'studies',
          'query' => 'dataset(in(Mica_dataset.id,' . $dataset_id . '))',
          'display' => 'list'
        ));
  }

  /**
   * Get link to list of networks by dataset id.
   *
   * @param string $text
   *   Text link.
   * @param string $dataset_id
   *   The dataset id.
   * @param array $attributes
   *   A set of link attributes.
   *
   * @return string
   *   The anchor link.
   */
  public static function datasetNetworks($text, $dataset_id, array $attributes = array()) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        $text,
        $attributes,
        array(
          'type' => 'networks',
          'query' => 'dataset(in(Mica_dataset.id,' . $dataset_id . '))',
          'display' => 'list'
        ));
  }

  /**
   * A search button studies.
   *
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function searchStudies($is_button = FALSE, $className) {
    $query = DrupalMicaClient\RqlQueryBuilder::exists_query('Mica_study', 'id');
    if (!empty($className) && DrupalMicaStudyResource::ALL_STUDIES != $className) {
      $query = sprintf(DrupalMicaClient\RqlQueryBuilder::and_query(
        $query, DrupalMicaClient\RqlQueryBuilder::className_query('Mica_study', $className))
      );
    }

    return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
      variable_get_value('studies_search_label'),
      array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
      array(
        'type' => 'studies',
        'query' => DrupalMicaClient\RqlQueryBuilder::study_query($query),
        'display' => 'list'
      ));
  }

  /**
   * The studies coverage anchor link.
   *
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageStudies($is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('variable_coverage_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'query' => 'study(exists(Mica_study.id))',
          'display' => 'coverage'
        ));
  }

  /**
   * The study coverage anchor link.
   *
   * @param string $study_id
   *   The study id.
   * @param bool $is_button
   *   As link or button rendering.
   *
   * @return string
   *   The anchor link.
   */
  public static function coverageStudy($study_id, $is_button = FALSE) {
      return ObibaSearchResources::repositoryAnchor(MicaClientPathProvider::REPOSITORY_SEARCH,
        variable_get_value('variable_coverage_label'),
        array('class' => $is_button ? self::DEFAULT_PRIMARY_BUTTON_CLASSES : ''),
        array(
          'query' => 'study(in(Mica_study.id,' . $study_id . '))',
          'display' => 'coverage'
        ));
  }

  /**
   * Get list item of given entities.
   *
   * @param object $dto
   *   The entity Dto (study, variable, network, ...)
   * @param string $url
   *   The provided entity detail path.
   *
   * @return string
   *   The anchor link.
   */
  public static function listItem($dto, $url) {
    $acronym = obiba_mica_commons_get_localized_field($dto, 'acronym');
    $name = obiba_mica_commons_get_localized_field($dto, 'name');
    $title_order_option = variable_get_value('study_title_acronym_display');
    if (!empty($title_order_option)) {
      if ($title_order_option == 1) {
        return l($acronym == $name ? $acronym : $acronym . '  -  ' . $name, $url);
      }
      if ($title_order_option == 2) {
        return l($name, $url);
      }

    }
    return l($acronym == $name ? $acronym : $name . '  -  ' . $acronym, $url);

  }

  /**
   * Construct an ajax friendly anchor.
   *
   * @param string $url
   *   The provided entity detail path.
   * @param string $text
   *   The text link.
   * @param array $attributes
   *   A set of given attributes.
   * @param array $query_params
   *   Query parameters.
   *
   * @return string
   *   The anchor link.
   */
  public static function ajaxFriendlyAnchor($url, $text, array $attributes, array $query_params) {
    $options = array();

    // Drupal may require css classes to be inside an array!
    if (!empty($attributes) && !empty($attributes['class'])) {
      $attributes['class'] = self::formatClassAsArray($attributes['class']);
    }

    if (!empty($attributes)) {
      $options['attributes'] = $attributes;
    }
    if (!empty($query_params)) {
      if (empty($query_params['query'])) {
        unset($query_params['query']);
      }
      $options['fragment'] = '!' . http_build_query($query_params);
    }

    return l($text, $url, $options);
  }

  /**
   * Format class as array.
   *
   * @param string $class
   *   A class to add.
   *
   * @return array
   *   A formatted class array.
   */
  public static function formatClassAsArray($class) {
    return is_array($class) ? $class : explode(' ', $class);
  }

}
