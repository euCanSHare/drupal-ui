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


if (module_exists('obiba_mica_dataset')) {
  $path_module_dataset = drupal_get_path('module', 'obiba_mica_dataset');
  include_once($path_module_dataset . '/includes/obiba_mica_dataset_resource.inc');
}

include_once('obiba_mica_study_dce-detail-modal.inc');

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;

function obiba_mica_study_ng_coverage($type_study, $study_id) {
  $coverages = json_encode(new stdClass());
  if($type_study === 'individual-study'){
    if (!variable_get_value('study_show_coverage_graphs')) {
      return $coverages;
    }
  }
  else{
    if (!variable_get_value('harmo_study_show_coverage_graphs')) {
      return $coverages;
    }
  }

  $query = DrupalMicaClient\RqlQueryBuilder::study_query_charts($study_id);
  return obiba_mica_graphics_nvd3_query_charts(
    $query,
    DrupalMicaClient\RqlQueryBuilder::study_query_charts_variables_template(),
    $study_id,
    NULL);
}

function obiba_mica_study_page_detail_networks($study_id) {
  if (!variable_get_value('study_show_networks')) {
    exit;
  }
  $cached_networks = obiba_mica_commons_get_cache('cached_' . __FUNCTION__ . $study_id);
  if (!empty($cached_networks)) {
    print $cached_networks;
  }
  else {
    $network_output = (module_exists('obiba_mica_network')) ?
      obiba_mica_network_networks_list($study_id) : NULL;

    if (!empty($network_output)) {
      $themed_study_networks = theme('obiba_mica_study_detail_networks', array('networks' => $network_output));
      obiba_mica_commons_set_cache('cached_' . __FUNCTION__ . $study_id, $themed_study_networks);
      print $themed_study_networks;
    }
  }
}

function obiba_mica_study_page_detail_datasets($study_id) {
  if (!variable_get_value('study_show_datasets')) {
    exit;
  }
  $cached_datasets = obiba_mica_commons_get_cache('cached_' . __FUNCTION__ . $study_id);
  if (!empty($cached_datasets)) {
    print $cached_datasets;
  }
  else {
    $dataset_output = (module_exists('obiba_mica_dataset')) ? obiba_mica_dataset_get_datasets_studies($study_id) : NULL;

    if (!empty($dataset_output)) {
      $themed_datasets = theme('obiba_mica_study_detail_datasets', array('datasets' => $dataset_output));
      obiba_mica_commons_set_cache('cached_' . __FUNCTION__ . $study_id, $themed_datasets);
      print $themed_datasets;
    }
  }
  exit;
}

function obiba_mica_study_page_detail($study_id, $token_key = NULL) {
  obiba_mica_study_load_libs();
  drupal_add_js(drupal_get_path('module', 'obiba_mica_study') . '/js/mica-study-detail.js', 'file');

  $url_param = explode('?', request_uri());
  if (!empty($url_param[1])) {
    parse_str($url_param[1], $parts);
  }
  $page_render_study = NULL;
  $themed_attachment = NULL;
  $flat_study_attachments = NULL;

  $localize = obiba_mica_commons_mica_server_localisation();
  $study_resource = new DrupalMicaStudyResource();
  if (!empty($token_key)) {
    obiba_mica_commons_is_published(FALSE);
    $study_dto = $study_resource->getStudy($study_id, $token_key, DrupalMicaStudyResource::INDIVIDUAL_STUDY);
    if(!empty($study_dto)){
     if(!empty($study_dto->logo)){
        $logo_path = obiba_mica_commons_safe_expose_server_url($study_dto->id, $study_dto->logo, $study_dto->studyResourcePath, FALSE, $token_key);
     }
    }
  }
  else {
    $study_dto = $study_resource->getStudy($study_id, NULL, DrupalMicaStudyResource::INDIVIDUAL_STUDY);
    if(!empty($study_dto)){
      if(!empty($study_dto->logo)) {
        $logo_path = obiba_mica_commons_safe_expose_server_url($study_dto->id, $study_dto->logo, $study_dto->studyResourcePath, FALSE);
      }
    }
  }
  if(!empty($logo_path)){
    $logo_image_tag = theme_image(array(
      'path' => $logo_path,
      'attributes' => array(
        'class' => 'imageThumb img-responsive'
      )
    ));
    $logo = l($logo_image_tag, $logo_path, array(
      'attributes' => array(
        'class' => 'fancybox-button'
      ),
      'html' => TRUE
    ));
  }
  if (!empty($study_dto)) {
    $acronym = obiba_mica_commons_get_localized_field($study_dto, 'acronym');
    $name = obiba_mica_commons_get_localized_field($study_dto, 'name');
    $title_order_option = variable_get_value('study_title_acronym_display');
    if (!empty($title_order_option)) {
      if ($title_order_option == 1) {
        drupal_set_title($acronym . ' - ' . $name);
      }
      else {
        if ($title_order_option == 2) {
          drupal_set_title($name);
        }
        else {
          if ($title_order_option == 3) {
            drupal_set_title($acronym);
          }
          else {
            drupal_set_title($name);
          }
        }
      }
    }
    else {
      drupal_set_title($name . ' - ' . $acronym);
    }

    drupal_set_breadcrumb(array(
      l(t('Home'), '<front>'),
      l($localize->getTranslation('studies'), DrupalMicaStudyResource::STUDIES, array(
        'fragment' => MicaListsHelper::studyFragment(ANGULAR_LIST_STUDIES)
      )),
      l($localize->getTranslation('global.individual-studies'),
        DrupalMicaStudyResource::STUDIES . '/' .  DrupalMicaStudyResource::INDIVIDUAL_STUDY,
        array(
          'fragment' => MicaListsHelper::studyFragment(ANGULAR_LIST_INDIVIDUAL_STUDIES)
        )),
    ));

    $opal_output = !empty($study_dto->opal) ? obiba_mica_study_get_opal_url($study_dto->opal) : NULL;
    $member_detail_modal = '';
    if (module_exists('obiba_mica_persons') && !empty($study_dto)) {
      if (!empty($study_dto->memberships)) {
        $config_resources = new DrupalMicaConfigResource();
        $members_roles = $config_resources->micaClientConfigResource->getSpecificConfigs(array('roles'));
        $ordered_membership = array_map(function ($members_role) use ($study_dto) {
          foreach ($study_dto->memberships as $membership) {
            if ($members_role == $membership->role) {
              return $membership;
            }
          }
        }, $members_roles['roles']);

        foreach ($study_dto->memberships as $membership) {
          if (!empty($membership->members)) {
            $member_detail_modal .= obiba_mica_persons_get_person_detail($membership->role, $study_dto->id, $membership->members);
          }
        }
      }
    }
    if (module_exists('obiba_mica_files')) {
        $has_files  = obiba_mica_files_get_flat_attachments('/' . DrupalMicaStudyResource::INDIVIDUAL_STUDY . '/' .  $study_id, !empty($token_key)?$token_key:NULL);
      if(!empty($has_files)){
        $file_browser = theme('obiba_mica_files_browser', array(
          'doc_path' => '/' . DrupalMicaStudyResource::INDIVIDUAL_STUDY,
          'doc_id' => $study_id,
          'token_key' => $token_key,
        ));
      }
      obiba_mica_app_angular_load_js_resources('obiba_mica_files');
    }
    $cached_populations = obiba_mica_commons_get_cache('populations_detail_cache-' . $study_id);
    if (!empty($cached_populations)) {
      $populations = $cached_populations;
    }
    else {
      $populations = obiba_mica_study_get_populations_detail($study_dto, $token_key);
      obiba_mica_commons_set_cache('populations_detail_cache-' . $study_id, $populations);
    }
    if(!empty($populations)){
      $dce_fix_modal = obiba_mica_study_get_dce_detail_modal($populations['dce-info']);
    }

    if (obiba_mica_study_have_timeline($study_dto)) {
      obiba_mica_study_get_timeline_detail($study_dto);
      $timeline_wrapper = '<div id="vis" style="width=100%"></div>';
    }
    $options_study_content = array(
      'showNetwork' => variable_get_value('study_show_networks'),
      'showDatasets' => variable_get_value('study_show_datasets'),
      'showCoverage' => variable_get_value('study_show_coverage_graphs')
    );
    drupal_add_js(array(
      'study_url' => 'mica/' . DrupalMicaStudyResource::INDIVIDUAL_STUDY . '/' .  rawurlencode($study_id),
      'optionsStudyContent' => $options_study_content
    ), 'setting');
    $study_theme_cache = obiba_mica_commons_get_cache('study_theme_cache-' . $study_id);
    if (!empty($study_theme_cache)) {
      return $study_theme_cache;
    }
    else {
      $permissionResource = new DrupalMicaClient\DrupalMicaClientPermission();
      $can_edit_draf_document = $permissionResource->canEditDraftDocument($study_dto);
      $study_theme ='';
      if (!empty($token_key)) {
        $publiched_link = obiba_mica_commons_get_draft_link(DrupalMicaStudyResource::INDIVIDUAL_STUDY, $study_id, $study_dto->published);
        $study_theme =  $publiched_link;
      }
      $study_theme .= theme('obiba_mica_study_detail',
        array(
          'draft_view' => !empty($token_key) ? TRUE : FALSE,
          'logo_study' => !empty($logo) ? $logo : NULL,
          'can_edit_draf_document' => $can_edit_draf_document ? $can_edit_draf_document : FALSE,
          'ordered_membership' => !empty($ordered_membership) ? $ordered_membership : NULL,
          'investigators_modal' => !empty($investigator_detail_modal) ? $investigator_detail_modal : NULL,
          'contacts_modal' => !empty($contact_detail_modal) ? $contact_detail_modal : NULL,
          'members_modal' => !empty($member_detail_modal) ? $member_detail_modal : NULL,
          'study_dto' => $study_dto,
          'file_browser' => !empty($file_browser) ? $file_browser : NULL,
          'timeline' => !empty($timeline_wrapper) ? $timeline_wrapper : NULL,
          'populations' => $populations,
          'opal' => $opal_output,
          'dce_fix_modal' => !empty($dce_fix_modal) ? $dce_fix_modal : NULL,
          'group_by' => !empty($parts['group-by']) ? $parts['group-by'] : NULL,
        ));
      obiba_mica_commons_set_cache('study_theme_cache-' . $study_id, $study_theme);
      return $study_theme;
    }

  }
  else {
    drupal_set_title($localize->getTranslation('study.none'));
    return '';
  }
}

function obiba_mica_study_have_timeline($study_dto) {
  if (empty($study_dto->populations)) {
    return FALSE;
  }
  else {
    foreach ($study_dto->populations as $population) {
      if (!empty($population->dataCollectionEvents)) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

function obiba_mica_study_get_opal_url($opal_url) {
  return theme('obiba_mica_study_opal', array('opal_url' => $opal_url));
}

/**
 * Implements hook_library().
 */
function obiba_mica_study_library() {
  $libraries = array();
  $version_lib = variable_get('obiba-time-line-version', '1.0.6');
  $lib_path = libraries_get_path('mica-study-timeline');
  // Make sure we have a valid library path before returning library load info.
  if (!empty($lib_path)) {
    $libraries['mica-study-timeline'] = array(
      'title' => 'MicaTimeLine',
      'website' => 'http://obiba.org/',
      'version' => $version_lib,
      'js' => array(
        $lib_path . '/dist/d3.min.js' => array(),
        $lib_path . '/dist/mica-study-timeline.min.js' => array(
          'type' => 'file',
          'scope' => 'footer',
        )
      ),
      'css' => array(
        $lib_path . '/dist/mica-study-timeline.min.css' => array(),
      )
    );
  }

  return $libraries;
}

/*
 * Format time-line schema
 * */
function obiba_mica_study_get_timeline_detail($study_detail) {
  $study_json = json_encode($study_detail);
  drupal_add_css(drupal_get_path('module', 'obiba_mica_study') . '/css/mica_studies.css', 'file');
  drupal_add_library('obiba_mica_study', 'mica-study-timeline');
  drupal_add_js(drupal_get_path('module', 'obiba_mica_study') . '/js/obiba-mica-study-timeline.js', array(
    'type' => 'file',
    'scope' => 'footer',
  ));
  drupal_add_js(array('obiba_mica_study' => array('study_json' => $study_json)), 'setting');
}

/*
 * Format populations schema
 * */

function obiba_mica_study_get_populations_detail($study_detail, $token_key = NULL) {
  $page_render_populations = array();
  $population_content_render = array();
  $dce_info = array();
  $themed_attachment = NULL;
  $localize = obiba_mica_commons_mica_server_localisation();
  if (!empty($study_detail->populations)) {
    usort($study_detail->populations, function ($a, $b) {return $a->weight - $b->weight;});
    foreach ($study_detail->populations as $population) {
      if (module_exists('obiba_mica_files')) {
            $file_browser = theme('obiba_mica_files_browser', array(
              'doc_path' => '/' . $study_detail->studyResourcePath . '/' . $study_detail->id . '/' . 'population',
              'doc_id' => $population->id,
              'token_key' => $token_key,
              'show_title' => true));
      }
      $dce_uids = array();
      $population_content_render['data'] = $population;
      if (!empty($population->dataCollectionEvents)) {
        usort($population->dataCollectionEvents, function($a, $b) {
          return $a->weight - $b->weight;
        });
        $dce_rows = obiba_mica_study_get_dce_table($population->dataCollectionEvents, $study_detail->id, $population->id);
        obiba_mica_commons_normalize_rows($dce_rows);
        $population_content_render['dce-tab'] = theme(
          'table',
          array(
            'header' => array(
              $localize->getTranslation('population.name'),
              $localize->getTranslation('population.description'),
              $localize->getTranslation('study.start'),
              $localize->getTranslation('study.end')
            ),
            'rows' => $dce_rows,
            'empty' => t('No data collection event found'),
            'sticky' => FALSE,
            'attributes' => array('id' => 'variables_overview')
          )
        );
        foreach ($population->dataCollectionEvents as $dce) {
          $dce_uids[] = $study_detail->id . ':' . $population->id . ':' . $dce->id;
        }
      }
      else {
        $population_content_render['dce-tab'] = '';
        $dce_uids[] = array();
      }
      if(!empty($population->dataCollectionEvents)){
        $dce_info[$population->id] = obiba_mica_study_get_dce_detail_info(
          $study_detail->studyResourcePath,
          $study_detail->id,
          $population->id,
          $population->dataCollectionEvents,
          $token_key,
          $localize
        );
      }
      $page_render_populations[$population->id] = array(
        'data' => $population_content_render,
        'html' => theme('mica_population_detail', array(
          'population_content' => theme('mica_population_content_detail', array(
            'dce_uids' => $dce_uids,
            'population' => $population,
            'general_population' => _obiba_mica_list_general_populations($population),
            'specific_population' => _obiba_mica_list_specific_populations($population),
            'selection_criteria' => _obiba_mica_list_selection_criteria($population),
            'file_browser' => !empty($file_browser)?$file_browser:NULL,
          )),
          'population' => $population_content_render,
        ))
      );
    }
  }
  $page_render_populations['dce-info'] = $dce_info;
  return $page_render_populations;
}

function _obiba_mica_list_general_populations($population) {
  $result = '';
  if (!empty($population->model) &&
    !empty($population->model->recruitment) &&
    !empty($population->model->recruitment->generalPopulationSources)
  ) {

    $localize = obiba_mica_commons_mica_server_localisation();
    foreach ($population->model->recruitment->generalPopulationSources as $key_source => $source_recruitment) {
      $result .= ($key_source !== 0 ? ', ' : '') .
        $localize->getTranslation('study_taxonomy.vocabulary.populations-recruitment-generalPopulationSources.term.' . $source_recruitment . '.title');
    }
  }

  return $result;
}

function _obiba_mica_list_specific_populations($population) {
  $result = '';
  if (!empty($population->model) &&
    !empty($population->model->recruitment) &&
    !empty($population->model->recruitment->specificPopulationSources)
  ) {

    $result = '';
    $localize = obiba_mica_commons_mica_server_localisation();
    foreach ($population->model->recruitment->specificPopulationSources as $key_specific => $specific_recruitment) {
      $result .= ($key_specific !== 0 ? ', ' : '') .
        $localize->getTranslation('study_taxonomy.vocabulary.populations-recruitment-specificPopulationSources.term.' . $specific_recruitment . '.title');

      if (stristr($specific_recruitment, 'other') && !empty($population->model->recruitment->otherSpecificPopulationSource)) {
        $result .= ': ' . obiba_mica_commons_get_localized_field($population->model->recruitment, 'otherSpecificPopulationSource');
      }
    }
  }

  return $result;
}

function _obiba_mica_list_selection_criteria($population) {
  $result = '';
  if (!empty($population->model) &&
    !empty($population->model->selectionCriteria) &&
    !empty($population->model->selectionCriteria->criteria)
  ) {

    $localize = obiba_mica_commons_mica_server_localisation();
    foreach ($population->model->selectionCriteria->criteria as $ky_criteria => $criteria) {
      $result .= ($ky_criteria !== 0 ? ', ' : '') .
        $localize->getTranslation('study_taxonomy.vocabulary.populations-selectionCriteria-criteria.term.' . $criteria . '.title');
    }
  }

  return $result;
}

/**
 * Create modal DOM for data collection events
 *
 * @param $study_id
 * @param $data_collection_events
 *
 * @return string
 */
function obiba_mica_study_get_dce_detail($study_resource_path, $study_id, $population_id, $data_collection_events, $dce_variables_nbr = NULL, $has_coverage = NULL, $token_key = NULL) {
  $page_render_dces = '';
  $themed_dce_attachment = NULL;
  foreach ($data_collection_events as $dce) {
    if (module_exists('obiba_mica_files')) {
      $file_browser=NULL;
        $file_browser = theme('obiba_mica_files_browser', array(
          'doc_path' => '/' . $study_resource_path .'/' . $study_id . '/' . 'population/'.$population_id . '/data-collection-event',
          'doc_id' => $dce->id,
          'token_key' => $token_key,
        ));
    }
    $page_render_dces .= theme('mica_dce_detail', array(
      'has_coverage' => $has_coverage,
      'dce_variables_nbr' => $dce_variables_nbr,
      'study_id' => $study_id,
      'population_id' => $population_id,
      'dce_uid' => $study_id . ':' . $population_id . ':' . $dce->id,
      'dce_id_target' => MicaClientPathHelpers::normalizeModalTarget($study_id . '-' . $population_id . '-' . $dce->id, TRUE),
      'dce' => $dce,
      'file_browser' => !empty($file_browser) ? $file_browser : NULL,
    ));
  }
  return $page_render_dces;
}

/*
 * retrieve Data Collection event
 * */
function obiba_mica_study_get_dce_table($data_collection_events, $study_id, $population_id) {
  $localize = obiba_mica_commons_mica_server_localisation();
  $dce_rows = array();
  foreach ($data_collection_events as $key_dce => $dce_wrapper) {
    $dce_description = NULL;
    if (!empty($dce_wrapper->model->description) || !empty($dce_wrapper->description)) {
      $dce_description = obiba_mica_commons_markdown(truncate_utf8(strip_tags(obiba_mica_commons_get_localized_field($dce_wrapper, 'description')), 50, TRUE, TRUE));
    }
    // Hide DCE that are not published on study published page

    $dce_rows[$key_dce] = array(
      'data' => array(
        'label' => l(obiba_mica_commons_get_localized_field($dce_wrapper, 'name'), '#', array(
          'external' => TRUE,
          'attributes' => array(
            'data-toggle' => 'modal',
            'data-dceId' => DrupalMicaStudyResource::studyPopulationDceModalTarget($study_id, $population_id, $dce_wrapper),
            'data-target' => '#dce-modal'
          )
        )),
        'desc' => $dce_description,
        'start_year' => $dce_wrapper->startYear,
        'start_month' => !empty($dce_wrapper->startMonth) ? $dce_wrapper->startMonth : NULL,
        'end_year' => !empty($dce_wrapper->endYear) ? $dce_wrapper->endYear : $localize->getTranslation('search.coverage-end-date-ongoing'),
        'end_month' => !empty($dce_wrapper->endMonth) ? $dce_wrapper->endMonth : NULL,
      )
    );
  }
  return $dce_rows;
}