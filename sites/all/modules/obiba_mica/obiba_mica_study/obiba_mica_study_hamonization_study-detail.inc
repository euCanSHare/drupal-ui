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


$path_module_study = drupal_get_path('module', 'obiba_mica_study');
include_once($path_module_study . '/obiba_mica_study-page-detail.inc');

$path_module_dataset = drupal_get_path('module', 'obiba_mica_dataset');
include_once($path_module_dataset . '/obiba_mica_dataset-page-detail.inc');

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;

function obiba_mica_study_harmonization_page_detail($study_id, $token_key = NULL) {
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
    $study_dto = $study_resource->getStudy($study_id, $token_key, DrupalMicaStudyResource::HARMONIZATION_STUDY);
    if(!empty($study_dto)){
      if(!empty($study_dto->logo)){
        $logo_path = obiba_mica_commons_safe_expose_server_url($study_dto->id, $study_dto->logo, $study_dto->studyResourcePath, FALSE, $token_key);
      }
    }
  }
  else {
    $study_dto = $study_resource->getStudy($study_id, NULL, DrupalMicaStudyResource::HARMONIZATION_STUDY);
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
    $title_order_option = variable_get_value('harmo_study_title_acronym_display');
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
      l($localize->getTranslation('global.harmonization-studies'),
        DrupalMicaStudyResource::STUDIES . '/' .  DrupalMicaStudyResource::HARMONIZATION_STUDY,
        array(
          'fragment' => MicaListsHelper::studyFragment(ANGULAR_LIST_HARMONIZATION_STUDIES)
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
      $has_files  = obiba_mica_files_get_flat_attachments('/' . $study_dto->studyResourcePath . '/' . $study_id, !empty($token_key)?$token_key:NULL);
      if(!empty($has_files)){
        $file_browser = theme('obiba_mica_files_browser', array(
          'doc_path' => '/' . $study_dto->studyResourcePath,
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

    $options_study_content = array(
      'showNetwork' => variable_get_value('harmo_study_show_networks'),
      'showDatasets' => variable_get_value('harmo_study_show_datasets'),
      'showCoverage' => variable_get_value('harmo_study_show_coverage_graphs')
    );
    drupal_add_js(array(
      'study_url' => 'mica/' . DrupalMicaStudyResource::HARMONIZATION_STUDY . '/' . rawurlencode($study_id),
      'optionsStudyContent' => $options_study_content
    ), 'setting');
    $study_tables = obiba_mica_dataset_study_tables($study_dto->{'obiba.mica.HarmonizationStudyDto.type'},
      $study_dto->studyResourcePath ,$study_id, 'obiba_mica_harmo_study_studies_table_show_variable');
    $study_theme_cache = obiba_mica_commons_get_cache('harmonization_study_theme_cache-' . $study_id);
    if (!empty($study_theme_cache)) {
      return $study_theme_cache;
    }
    else {
      $permissionResource = new DrupalMicaClient\DrupalMicaClientPermission();
      $can_edit_draf_document = $permissionResource->canEditDraftDocument($study_dto);
      $study_theme ='';
      if (!empty($token_key)) {
        $publiched_link = obiba_mica_commons_get_draft_link(DrupalMicaStudyResource::HARMONIZATION_STUDY, $study_id, $study_dto->published);
        $study_theme =  $publiched_link;
      }
      $study_theme .= theme('obiba_mica_study_harmonization_study-detail',
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
          'populations' => $populations,
          'opal' => $opal_output,
          'group_by' => !empty($parts['group-by']) ? $parts['group-by'] : NULL,
          'study_tables' => $study_tables,
        ));
      obiba_mica_commons_set_cache('harmonization_study_theme_cache-' . $study_id, $study_theme);
      return $study_theme;
    }

  }
  else {
    drupal_set_title($localize->getTranslation('study.none'));
    return '';
  }
}