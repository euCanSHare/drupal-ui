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
 * Mica studies file
 */


/**
 * Create modal Single DOM for data collection events
 *
 * @return string
 */
function obiba_mica_study_get_dce_detail_modal($dce_info){;
  drupal_add_js(drupal_get_path('module', 'obiba_mica_study') . '/js/obiba-mica-study-dce-detail-modal.js', 'file');
  drupal_add_js(array(
    'dceModalInfoArray' => $dce_info
  ), 'setting');
  return theme('obiba_mica_study_dce_detail_modal');
}

/**
 * Create modal DOM for data collection events
 *
 * @param $study_id
 * @param $data_collection_events
 *
 * @return array
 */
function obiba_mica_study_get_dce_detail_info($study_resource_path, $study_id, $population_id, $data_collection_events, $token_key = NULL, $localize) {
  $page_render_dces = [];
  $themed_dce_attachment = NULL;
  foreach ($data_collection_events as $dce) {
    if (module_exists('obiba_mica_files')) {
        $file_browser = new stdClass();
        $file_browser->marckup = array(
          'doc_path' => '/' . $study_resource_path .'/' . $study_id . '/' . 'population/'.$population_id . '/data-collection-event',
          'doc_id' => $dce->id,
          'token_key' => $token_key);
    }
    $page_render_dces[] = array(
      'study_id' => $study_id,
      'population_id' => $population_id,
      'dce_uid' => $study_id . ':' . $population_id . ':' . $dce->id,
      'dce' => obiba_mica_study_build_dce_detail_info($dce, $localize),
      'file_browser' => !empty($file_browser) ? $file_browser : NULL,
    );
  }
  return $page_render_dces;
}

/**
 * build data collection events details information
 *
 * @param $dce Dto
 * @param $localize
 * @return object
 */
function obiba_mica_study_build_dce_detail_info($dce, $localize){
  $dce_info = new stdClass();
  $dce_info->name = obiba_mica_commons_get_localized_field($dce, 'name');
  $dce_info->description = obiba_mica_commons_markdown(obiba_mica_commons_get_localized_field($dce, 'description'));
  if(!empty(($dce->startYear))){
    $dce_info->startYear['title'] = $localize->getTranslation('data-collection-event.start-year');
    $dce_info->startYear['value'] = obiba_mica_commons_format_year($dce->startYear, !empty($dce->startMonth) ? $dce->startMonth : NULL);
  }

  $dce_info->endYear['title'] = $localize->getTranslation('data-collection-event.end-year');
  if (!empty($dce->endYear)){
    $dce_info->endYear['value'] = obiba_mica_commons_format_year($dce->endYear, !empty($dce->endMonth) ? $dce->endMonth : NULL);
  }
  else{
    $dce_info->endYear['value'] =$localize->getTranslation('search.coverage-end-date-ongoing');
  }

  if(!empty($dce->model->dataSources)){
    $dce_info->dataSources['title'] = $localize->getTranslation('data-collection-event.data-sources');
    $dce_info->dataSources['list'] = obiba_mica_study_build_model_field_list(
      $dce->model,
      'dataSources',
      'study_taxonomy.vocabulary.populations-dataCollectionEvents-dataSources.term.',
      $localize,
      'otherDataSources'
    );
  }

  if (!empty($dce->model->administrativeDatabases)){
    $dce_info->administrativeDatabases['title'] = $localize->getTranslation('data-collection-event.admin-databases');
    $dce_info->administrativeDatabases['list'] = obiba_mica_study_build_model_field_list(
      $dce->model,
      'administrativeDatabases',
      'study_taxonomy.vocabulary.populations-dataCollectionEvents-administrativeDatabases.term.',
      $localize
    );
  }

  if (!empty($dce->model->bioSamples)){
    $dce_info->bioSamples['title'] = $localize->getTranslation('data-collection-event.bio-samples');
    $dce_info->bioSamples['list'] = obiba_mica_study_build_model_field_list(
      $dce->model,
      'bioSamples',
      'study_taxonomy.vocabulary.populations-dataCollectionEvents-bioSamples.term.',
      $localize,
      'otherBioSamples',
      'tissueTypes'
    );
  }
  return $dce_info;
}

function obiba_mica_study_build_model_field_list($dce_model, $fields, $translation_string, $localize, $others = NULL, $tissues = NULL) {
  $list = "<ul>";
  foreach ($dce_model->{$fields} as $field){
    $list .= '<li>';
    $list .= $localize->getTranslation($translation_string . $field . '.title');
    if(!empty($others) && $field == 'others' ){
      $other = obiba_mica_commons_get_localized_field($dce_model, $others);
      if(!empty($other)){
        $list .= ': ' . $other;
      }
    }
    if(!empty($tissues) && $field == 'tissues' ){
      $tissue = obiba_mica_commons_get_localized_field($dce_model, $tissues);
      if(!empty($tissue)){
        $list .= ': ' . $tissue;
      }
    }
    $list .= '</li>';
  }
  $list .= '</ul>';
  return $list;

}