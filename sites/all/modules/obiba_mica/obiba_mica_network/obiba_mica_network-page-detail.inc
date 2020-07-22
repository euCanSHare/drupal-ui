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

/*
 * @file code for network detail pages
 * */

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;
use Obiba\ObibaMicaClient\MicaLocalisation as MicaLocalisation;

include_once('includes/obiba_mica_network_resource.inc');

$path_module_study = drupal_get_path('module', 'obiba_mica_study');
include_once($path_module_study . '/obiba_mica_study-page-detail.inc');

function obiba_mica_network_page_detail($network_id, $token_key = NULL) {
  $url_param = explode('?', request_uri());
  $network_resource = new DrupalMicaNetworkResource();
  if (!empty($url_param[1])) {
    parse_str($url_param[1], $parts);
  }
  $themed_attachment = NULL;

  if (!empty($token_key)) {
    obiba_mica_commons_is_published(FALSE);
    $network_dto = $network_resource->getNetwork($network_id, $token_key);
    if (!empty($network_dto->logo)) {
      $logo_path = obiba_mica_commons_safe_expose_server_url($network_id, $network_dto->logo, 'network', FALSE, $token_key);
    }
  }
  else {
    $network_dto = $network_resource->getNetwork($network_id);
    if (!empty($network_dto->logo)) {
      $logo_path = obiba_mica_commons_safe_expose_server_url($network_id, $network_dto->logo, 'network', FALSE);
    }
  }
  if (!empty($logo_path)) {
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

  $localize = obiba_mica_commons_mica_server_localisation();

  $studies_statistics = '';
  if (!empty($network_dto)) {

    if (!empty($network_dto->networkSummaries)) {
      $ids = array_map(function ($summary) {
        return $summary->id;
      }, $network_dto->networkSummaries);
      obiba_mica_network_networks_datatable_init($network_dto->networkSummaries, $network_resource->getNetworkDetails($ids));
    }

    if (!empty($network_dto->studySummaries)) {
      obiba_mica_network_studies_datatable_init($network_dto->studySummaries, $network_id);
    }

    $acronym = obiba_mica_commons_get_localized_field($network_dto, 'acronym');
    $name = obiba_mica_commons_get_localized_field($network_dto, 'name');
    drupal_set_title($acronym . ' - ' . $name);

    drupal_set_breadcrumb(array(
      l(t('Home'), '<front>'),
      l($localize->getTranslation('networks'), MicaClientPathProvider::NETWORKS, array(
        'fragment' => MicaListsHelper::networkFragment()
      )),
    ));
    $studies_network_ids = array();
    if (module_exists('obiba_mica_persons') && (!empty($network_dto->studyIds) || !empty($network_dto->networkIds))) {
      if (!empty($network_dto->studyIds)) {
        $studies_network_ids = $network_dto->studyIds;
      }
      if (!empty($network_dto->networkSummaries)) {
        foreach ($network_dto->networkSummaries as $network_summary) {
          if (!empty($network_summary->studyIds)) {
            $studies_network_ids = array_merge($studies_network_ids, $network_summary->studyIds);
          }
        }
      }
      $entities_id = array(
        'studiesId' => !empty($studies_network_ids) ? $studies_network_ids : NULL,
        'networksId' => !empty($network_dto->networkIds) ? $network_dto->networkIds : NULL
      );
      obiba_mica_persons_datatable_init($entities_id);

      $associated_people_button = theme('obiba_mica_persons-button');
    }

    $associated_people_modal = theme('obiba_mica_persons-modal',
      array('persons_table' => theme('obiba_mica_persons-table')));
    $contact_detail_modal = '';
    foreach ($network_dto->memberships as $membership) {
      $contact_detail_modal .= obiba_mica_persons_get_person_detail($membership->role,
        $network_dto->id, !empty($membership->members) ? $membership->members : NULL);
    }
    if (module_exists('obiba_mica_files')) {
      $has_files = obiba_mica_files_get_flat_attachments('/network/' . $network_id, !empty($token_key) ? $token_key : NULL);
      if (!empty($has_files)) {
        $file_browser = theme('obiba_mica_files_browser', array(
          'doc_path' => '/network',
          'doc_id' => $network_id,
          'token_key' => !empty($token_key) ? $token_key : ''
        ));
      }
      obiba_mica_app_angular_load_js_resources('obiba_mica_files');
    }

    $networks_id = array($network_id);
    if (module_exists('obiba_mica_graphic')) {
      if (!empty($network_dto->studyIds) || !empty($network_dto->networkIds)) {
        $have_graphic_content = variable_get_value('graphics_content');
        if ($have_graphic_content) {
          if (!empty($network_dto->networkIds)) {
            $networks_id = array_merge($networks_id, $network_dto->networkIds);
          }
          obiba_mica_app_angular_load_js_resources('obiba_mica_graphic');

          $studies_statistics = !empty($network_dto->published) ? obiba_mica_network_statistics_angular_options($networks_id) : '';
        }
      }
    }
    $network_theme = $network_resource->drupalCache->MicaGetCache('network_theme_cache-' . $network_id);
    if (!empty($network_theme)) {
      return $network_theme;
    }
    else {
      $network_theme = '';
      if (!empty($token_key)) {
        $publiched_link = obiba_mica_commons_get_draft_link('network', $network_id, $network_dto->published);
        $network_theme = $network_theme . $publiched_link;
      }
      $permissionResource = new DrupalMicaClient\DrupalMicaClientPermission();
      $can_edit_draf_document = $permissionResource->canEditDraftDocument($network_dto);
      global $language;
      $network_theme .= theme('obiba_mica_network-detail', array(
        'draft_view' => !empty($token_key) ? TRUE : FALSE,
        'logo_network' => !empty($logo) ? $logo : NULL,
        'can_edit_draf_document' => $can_edit_draf_document ? $can_edit_draf_document : FALSE,
        'investigators_modal' => !empty($investigator_detail_modal) ?
          $investigator_detail_modal : NULL,
        'contacts_modal' => !empty($contact_detail_modal) ?
          $contact_detail_modal : NULL,
        'network_dto' => $network_dto,
        'has_variables' => !empty($network_dto->studySummaries) ?
          _obiba_mica_network_has_variables($network_dto->studySummaries) : FALSE,
        'group_by' => !empty($parts['group-by']) ? $parts['group-by'] : 'studyIds',
        'associated_people_button' => !empty($associated_people_button) ?
          $associated_people_button : NULL,
        'associated_people_modal' => !empty($associated_people_modal) ?
          $associated_people_modal : NULL,
        'file_browser' => !empty($file_browser) ? $file_browser : NULL,

        'statistics' => $studies_statistics,
        'current_lang' => $language->language,
      ));
      $network_resource->drupalCache->MicaSetCache('network_theme_cache-' . $network_id, $network_theme);
      return $network_theme;
    }
  }
  else {
    drupal_set_title('Network Not Found');
    return '';
  }
}

function obiba_mica_network_ng_coverage($network_id) {
  $includeTerms = (variable_get_value('obiba_mica_network_studies_variable_classifications') === "0") ?
    FALSE : TRUE;
  $localize = obiba_mica_commons_mica_server_localisation();
  $network_resource = new DrupalMicaNetworkResource();
  $network_dto = $network_resource->getNetwork($network_id);
  if (!empty($network_dto) && !empty($network_dto->studyIds)) {
    $study_ids = $network_dto->studyIds;
    $query = DrupalMicaClient\RqlQueryBuilder::network_query_charts($study_ids);
    $query_template = $includeTerms ? DrupalMicaClient\RqlQueryBuilder::network_query_charts_studies_template($network_id) : DrupalMicaClient\RqlQueryBuilder::network_query_charts_variables_template();
    return obiba_mica_graphics_nvd3_query_charts($query,
      $query_template,
      $study_ids,
      $localize->getTranslation('studies'),
      'network', $includeTerms);
  }
}

function obiba_mica_network_statistics_angular_options($networks_id) {
  obiba_mica_graphic_local_graphics_options(
    array(
      'entityType' => 'network',
      'entityIds' => implode(',', $networks_id)
    ));
  return theme('obiba_mica_network-charts');
}

/**
 * @param $network_dto
 */
function obiba_mica_network_networks_datatable_init($network_summaries, $network_details) {
  if (drupal_get_library('obiba_mica_dataset', 'datatables')) {
    drupal_add_library('obiba_mica_dataset', 'datatables');
  }
  else {
    obiba_mica_commons_datatables_external_source();
  }

  drupal_add_js(drupal_get_path('module', 'obiba_mica_network') . '/js/obiba_mica_network_networks_datatable_init.js', 'file');

  drupal_add_js(array(
    'table_network_networks_headers' => obiba_mica_network_network_table_headers(),
    'table_network_networks_data' => obiba_mica_network_links_table_rows($network_summaries, $network_details)
  ), 'setting');
}

function obiba_mica_network_links_table_rows($network_summaries, $network_details) {
  $rows = array();
  if (!empty($network_details->networks)) {
    $networks_ids = array_map(function ($network) {
      return $network->id;
    }, $network_details->networks);

    $networks_cache_key = implode(',', $networks_ids);
    $cached_network_table_rows = obiba_mica_commons_get_cache('cached_' . __FUNCTION__ . $networks_cache_key);
  }
  if (!empty($cached_network_table_rows)) {
    return $cached_network_table_rows;
  }
  else {
    /**
     * Helper closure to calculate total number of participants and a list of all countries
     *
     * @param $network
     * @return array
     */
    $get_participants_countries = function ($network) {
      if (empty($network->studySummaries)) {
        return array('targets' => 0, 'countries' => '');
      }
      $targets = 0;
      foreach ($network->studySummaries as $summary) {
        $targets += empty($summary->targetNumber) ? 0 : $summary->targetNumber->number;
        if (!empty($summary->countries)) {
          $countries[] = implode(',', $summary->countries);
        }
      };

      return array(
        'targets' => obiba_mica_commons_format_number($targets),
        'countries' => obiba_mica_commons_countries(array_unique($countries))
      );
    };

    if (!empty($network_details) && !empty($network_details->networks)) {
      foreach ($network_details->networks as $network) {
        $extra = $get_participants_countries($network);
        $study_variables = empty($network->{'obiba.mica.CountStatsDto.networkCountStats'}->studyVariables) ? '-' :
          MicaClientAnchorHelper::networkVariables(obiba_mica_commons_format_number($network->{'obiba.mica.CountStatsDto.networkCountStats'}->studyVariables),
            $network->id, array(), 'study(in(Mica_study.className,Study))');
        $dataschema_variables = empty($network->{'obiba.mica.CountStatsDto.networkCountStats'}->dataschemaVariables) ? '-' :
          MicaClientAnchorHelper::networkVariables(obiba_mica_commons_format_number($network->{'obiba.mica.CountStatsDto.networkCountStats'}->dataschemaVariables),
            $network->id, array(), 'study(in(Mica_study.className,HarmonizationStudy))');
        $rows[] = array(
          MicaClientAnchorHelper::network($network),
          obiba_mica_commons_get_localized_field($network, 'name'),
          $network->{'obiba.mica.CountStatsDto.networkCountStats'}->studies,
          $extra['targets'],
          $extra['countries'],
          $study_variables,
          $dataschema_variables
        );
      }
    }

    $unpublished_networks = array_filter($network_summaries, function ($summary) {
      return !$summary->published;
    });

    if (!empty($unpublished_networks)) {
      foreach ($unpublished_networks as $unpublished_network) {
        $rows[] = array(
          obiba_mica_commons_get_localized_field($unpublished_network, 'acronym'),
          t(obiba_mica_commons_get_localized_field($unpublished_network, 'name')),
          '-',
          '-',
          '-',
          '-',
          '-'
        );
      }
    }
    if (!empty($networks_cache_key)) {
      obiba_mica_commons_set_cache('cached_' . __FUNCTION__ . $networks_cache_key, $rows);
    }
    return $rows;
  }
}

/**
 * @param $network_dto
 */
function obiba_mica_network_studies_datatable_init($study_summaries, $id_network = NULL) {
  if (drupal_get_library('obiba_mica_dataset', 'datatables')) {
    drupal_add_library('obiba_mica_dataset', 'datatables');
  }
  else {
    obiba_mica_commons_datatables_external_source();
  }
  $query = 'network(in(Mica_network.id,' . $id_network . '))';
  drupal_add_js(drupal_get_path('module', 'obiba_mica_network') . '/js/obiba_mica_network_studies_datatable_init.js', 'file');
  drupal_add_js(array(
    'individual_study_table_headers' =>
      obiba_mica_study_study_summaries_table_headers(DrupalMicaStudyResource::INDIVIDUAL_STUDY, 'obiba_mica_network_studies_table_show_variable'),
    'harmonization_study_table_headers' =>
      obiba_mica_study_study_summaries_table_headers(DrupalMicaStudyResource::HARMONIZATION_STUDY, 'obiba_mica_network_studies_table_show_variable'),
    'individual_study_table_data' =>
      obiba_mica_study_study_summaries_table_row($study_summaries, $id_network,
        DrupalMicaStudyResource::INDIVIDUAL_STUDY, $query, 'obiba_mica_network_studies_table_show_variable'),
    'harmonization_study_table_data' =>
      obiba_mica_study_study_summaries_table_row($study_summaries, $id_network,
        DrupalMicaStudyResource::HARMONIZATION_STUDY, $query, 'obiba_mica_network_studies_table_show_variable')
  ), 'setting');
}

function obiba_mica_network_network_table_headers() {
  $localize = obiba_mica_commons_mica_server_localisation();
  return array(
    array(
      "title" => $localize->getTranslation('network.acronym'),
      'width' => '15%'
    ),
    array(
      "title" => $localize->getTranslation('network.name'),
      'width' => '40%'
    ),
    array("title" => $localize->getTranslation('studies'), 'width' => '5%'),
    array(
      "title" => $localize->getTranslation('search.study.participants'),
      'width' => '10%'
    ),
    array(
      "title" => $localize->getTranslation('client.label.countries'),
      'width' => '20%'
    ),
    array(
      "title" => $localize->getTranslation('client.label.study-variables'),
      'width' => '5%'
    ),
    array(
      "title" => $localize->getTranslation('client.label.dataschema-variables'),
      'width' => '5%'
    )
  );
}

function _obiba_mica_network_has_variables($study_summaries) {
  if (!empty($study_summaries)) {
    foreach ($study_summaries as $study_summary) {
      if (!empty($study_summary->variables)) {
        return TRUE;
      }
    }
  }
  return FALSE;
}
