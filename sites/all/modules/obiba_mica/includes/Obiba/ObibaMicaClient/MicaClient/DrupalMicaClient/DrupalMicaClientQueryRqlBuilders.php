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

namespace Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient;

use Obiba\ObibaMicaClient\MicaConfigurations as MicaConfig;

class RqlQueryBuilder {
  function __construct() {

  }

  public static function network_query_charts($studyIds) {
    return self::createChartsQuery(
      "variable(in(studyId,(%s)),sort(name),aggregate(%s,bucket(studyId))),study(in(Mica_study.className,Study)),locale(%s)",
      $studyIds
    );
  }

  public static function study_query_charts($studyId) {
    return self::createChartsQuery(
      "variable(eq(studyId,%s),sort(name),aggregate(%s,bucket(dceId))),locale(%s)",
      $studyId
    );
  }

  public static function study_query_charts_variables_template() {
    return "variable(and(exists(%s.%s),in(Mica_variable.dceId,(%s))))";
  }

  public static function network_query_charts_variables_template() {
    return "variable(and(exists(%s.%s),in(Mica_variable.studyId,(%s))))";
  }

  public static function network_query_charts_studies_template($network_id) {
    return "variable(in(%s,%s)),network(in(Mica_network.id,$network_id)),study(in(Mica_study.className,Study))";
  }

  public static function dataset_query_charts_variables_template() {
    return "variable(and(exists(%s.%s),in(Mica_variable.datasetId,%s)))";
  }

  public static function dataset_query_charts($datasetId) {
    return self::createChartsQuery(
      "variable(eq(datasetId,%s),sort(name),aggregate(%s,bucket(datasetId))),locale(%s)",
      $datasetId
    );
  }

  public static function networks($networkIds) {
    return self::createQuery(
      "network(in(id,(%s)),sort(acronym)),locale(%s)",
      $networkIds
    );
  }

  public static function variable_queries($queries) {
    if (!is_array($queries)) {
      return self::variable_query($queries);
    }
    return sprintf("variable(%s)", join(',', $queries));
  }

  public static function variable_query($query) {
    return sprintf("variable(%s)", $query);
  }

  public static function study_queries($queries) {
    if (!is_array($queries)) {
      return self::study_query($queries);
    }
    return sprintf("study(%s)", join(',', $queries));
  }

  public static function study_query($query) {
    return sprintf("study(%s)", $query);
  }

  public static function network_queries($queries) {
    if (!is_array($queries)) {
      return self::network_query($queries);
    }
    return sprintf("network(%s)", join(',', $queries));
  }

  public static function network_query($query) {
    return sprintf("network(%s)", $query);
  }

  public static function dataset_queries($queries) {
    if (!is_array($queries)) {
      return self::dataset_query($queries);
    }
    return sprintf("dataset(%s)", join(',', $queries));
  }

  public static function dataset_query($query) {
    return sprintf("dataset(%s)", $query);
  }

  public static function match_query($query, $taxonomy, $vocabularies) {
    if (is_array($vocabularies)) {
      $fields = join(',', array_map(function($vocabulary) use($taxonomy) {
        return $taxonomy . '.' . $vocabulary;
      }, $vocabularies));
    } else {
      $fields = $taxonomy . '.' . $vocabularies;
    }
    return sprintf("match(%s,(%s))", $query, $fields);
  }

  public static function fields_query($fields) {
    $fields =  is_array($fields) ? $fields : array($fields);
    return sprintf("fields((%s))", join(',', $fields));
  }

  public static function limit_query($from, $to) {
    return sprintf("limit(%s,%s)", $from, $to);
  }

  public static function sort_query($order, $sort) {
    $sort_array = array_map(function($element) use($order) {
      return $order . $element;
    }, explode(',', $sort));

    return sprintf("sort(%s)", join(',', $sort_array));
  }

  public static function and_query($lhsQuery, $rhsQuery) {
    return sprintf("and(%s,%s)", $lhsQuery, $rhsQuery);
  }

  public static function exists_query($taxonomy, $field) {
    return sprintf("exists(%s.%s)", $taxonomy, $field);
  }

  public static function in_query($taxonomy, $vocabulary, $terms) {
    $terms = is_array($terms) ? $terms : array($terms);
    return sprintf("in(%s.%s,(%s))", $taxonomy, $vocabulary, join(',',$terms));
  }

  public static function className_query($taxonomy, $className) {
    return self::in_query($taxonomy, "className", $className);
  }

  private static function createQuery($format, $args) {
    global $language;

    return sprintf(
      $format,
      is_array($args) ? join(',', $args) : $args,
      $language->language
    );
  }

  private static function createChartsQuery($format, $args) {
    global $language;

    return sprintf(
      $format,
      is_array($args) ? join(',', $args) : $args,
      self::createAggregationQuery(),
      $language->language
    );
  }


  private static function createAggregationQuery() {
    $config = new MicaConfig\MicaDrupalConfig();
    $figures = $config->MicaGetConfig('mica_taxonomy_figures');
    if (empty($figures)) {
      return '';
    }
    $taxonomies = array_map(function ($figure) {
      return $figure['value'].= '*';
    }, array_filter($figures, function ($figure){
        return !empty($figure['enable']);
    }));
    return sprintf("re(%s)", implode(',', $taxonomies));
  }

}
