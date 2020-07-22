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
 * Mica client research projects retrieve published Research Projects list.
 */

use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;
use Obiba\ObibaMicaClient\MicaLocalisation as MicaLocalisation;

include_once "obiba_mica_research_project_service.inc";

function obiba_mica_research_project_page_list() {
  obiba_mica_commons_list_document_js('refresh_list_projects');

  $project_query = NULL;
  $project_sort = NULL;
  $project_sort_by = NULL;
  $project_limits = NULL;

  $node_rendered = obiba_mica_commons_get_translated_node(variable_get_value('research_project_page'));
  drupal_set_title(variable_get_value('project_approved_page_title'));

  if (!empty($_GET['search-query'])) {
    $project_query = $_GET['search-query'];
  }
  if (!empty($_GET['search-sort'])) {
    $project_sort = $_GET['search-sort'];
  }
  if (!empty($_GET['search-sort-order'])) {
    $project_sort_by = $_GET['search-sort-order'];
  }
  if (!empty($_GET['search-nbr-result'])) {
    $project_limits = $_GET['search-nbr-result'];
  }

  $themed_projects = '';
  $node_rendered['#node']->title = '';

  $response = obiba_mica_research_project_get_projects($project_query, $project_limits, $project_sort, $project_sort_by);
  $total_projects = empty($response) ? 0 : $response->total;
  $project_limits = !(empty($project_limits)) ? $project_limits : DrupalMicaClientResource::getResponsePageSizeSmall();

  pager_default_initialize($total_projects, $project_limits);
  $pager_output = theme('pager', array('quantity' => $project_limits));

  if (!empty($response) && !empty($response->projects)) {
    $field_start_date_exist = obiba_mica_research_project_has_field('startDate');
    $field_end_date_exist = obiba_mica_research_project_has_field('endDate');
    foreach ($response->projects as $project) {
      $content = NULL;
      if (!empty($project->content)) {
        $content = (json_decode($project->content));
        if (empty($field_start_date_exist) && empty($field_end_date_exist)) {
          unset($content->startDate);
          unset($content->endDate);
        }
      }
      $themed_projects .= theme('obiba_mica_research_project-list-page-block', array(
        'project' => $project,
        'content' => $content
      ));
    }
  }
  else {
    $themed_projects = variable_get_value('project_empty_label');
  }

  $page_template = 'obiba_mica_research_project-list-page';
  $show_rapid_search_form = variable_get_value('project_approved_list_show_search_form');
  return theme($page_template, array(
    'form_search' => !empty($show_rapid_search_form) ? drupal_get_form('obiba_mica_research_project_create_form') : '',
    'node_content' => $node_rendered,
    'list_projects' => $themed_projects,
    'total_items' => $total_projects,
    'pager_wrap' => $pager_output
  ));
}

function obiba_mica_research_project_create_form() {
  $localize = obiba_mica_commons_mica_server_localisation();
  global $language;
  $context = array(
    'options' => array(
      'title.' . $language->language => $localize->getTranslation('research-project.title'),
    ),
    'default_sort' => 'title.' . $language->language,
    'default_sort_order' => 'asc'
  );

  return obiba_mica_commons_create_search_form($context, FALSE, FALSE);
}

function obiba_mica_research_project_get_projects($query = NULL, $limit = NULL, $sort = NULL, $order = NULL) {
  $from = 0;
  $research_project_resource = new DrupalMicaResearchProjectResource(NULL);
  $size_response = intval($limit) > 0 ? $limit : DrupalMicaClientResource::getResponsePageSizeSmall();
  if (!empty($_GET['page'])) {
    $from = $research_project_resource->paginationListSearchParameters($_GET['page'], 'projects', $size_response);
  }
  $response = $research_project_resource->getProjects($query, $from, $size_response, $sort, $order);
  if (!empty($response->total)) {
    $_SESSION['projects']['aggregations']['total_hits'] = $response->total;
  }
  return $response;
}


function obiba_mica_research_project_dar_research_projects_list_page() {
  $localize = obiba_mica_commons_mica_server_localisation();
  drupal_set_title(obiba_mica_research_project_list_page_title_callback());
  $permissionResource = new DrupalMicaClient\DrupalMicaClientPermission();
  $header_applicant = array();
  $header_tab_dynamic = array();
  $response = NULL;
  $response = obiba_mica_research_project_get_dar_projects();
  $user_has_role = $permissionResource->userHasRole('mica-data-access-officer');
  if ($user_has_role) {
    $header_applicant = array($localize->getTranslation('data-access-request.applicant'));
  }

  $header_tab_static = array(
    $localize->getTranslation('research-project.title'),
    $localize->getTranslation('research-project.data-access-request'),
  );
  $field_start_date_exist = obiba_mica_research_project_has_field('startDate');
  $field_end_date_exist = obiba_mica_research_project_has_field('endDate');
  if ($field_start_date_exist && $field_end_date_exist) {
    $header_tab_dynamic = array(
      $localize->getTranslation('research-project.default.status.start'),
      $localize->getTranslation('research-project.default.status.end'),
    );
  }
  $header_tab = !empty($header_tab_dynamic) ? array_merge($header_tab_static, $header_tab_dynamic) : $header_tab_static;
  $header = !empty($header_applicant) ? array_merge($header_applicant, $header_tab) : $header_tab;
  $rows = array();

  if (!empty($response) && !empty($response->projects)) {
    foreach ($response->projects as $project) {
      $content = NULL;
      $row_applicant = array();
      if (!empty($project->content)) {
        $content = (json_decode($project->content));
      }
      $user_has_role = $permissionResource->userHasRole('mica-data-access-officer');
      if ($user_has_role) {
        $row_applicant = array(!empty($project->request->applicant) ? $project->request->applicant : '');
      }
      $row = array(
        !empty($project->id) ? MicaClientPathProvider::project($project->id, obiba_mica_commons_get_localized_field($project, 'title')) : '',
        !empty($project->request) ?
          (!empty($project->request->viewable) ? MicaClientPathProvider::data_access_request($project->request->id) : $project->request->id) :
          '',
        (!empty($content->startDate) && $field_start_date_exist) ? obiba_mica_commons_convert_and_format_string_date($content->startDate, 'D. d-m-Y') : '',
        (!empty($content->endDate) && $field_end_date_exist) ? obiba_mica_commons_convert_and_format_string_date($content->endDate, 'D. d-m-Y') : ''
      );
      $rows[] = !empty($row_applicant) ? array_merge($row_applicant, $row) : $row;
    }

  }
  return theme('table', array(
    'header' => $header,
    'rows' => $rows,
    'empty' => $localize->getTranslation('research-project.none'),
  ));
}
