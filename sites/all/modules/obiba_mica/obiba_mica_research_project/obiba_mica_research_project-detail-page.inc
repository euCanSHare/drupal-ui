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

include_once('includes/obiba_mica_research_project_resource.inc');

use Obiba\ObibaMicaClient\MicaLocalisation as MicaLocalisation;

/**
 * @param $project_id
 * @return mixed
 */
function obiba_mica_research_project_page_detail($project_id, $token_key = NULL) {
  $research_project_resource = new DrupalMicaResearchProjectResource(NULL);
  $localize = obiba_mica_commons_mica_server_localisation();
  if (!empty($token_key)) {
    obiba_mica_commons_is_published(FALSE);
    $response = $research_project_resource->getProject($project_id, $token_key);
  }
  else{
    $response = $research_project_resource->getProject($project_id);
  }

  if(!empty($response)){
    $model = new stdClass();
    if (!empty($response->content)) {
      $model = json_decode($response->content);
    }

    if (module_exists('obiba_mica_files')) {
      $has_files = obiba_mica_files_get_flat_attachments('/project/'. $project_id, !empty($token_key)?$token_key:'');
if(!empty($has_files)){
  $file_browser = theme('obiba_mica_files_browser', array(
    'doc_path' => '/project',
    'doc_id' => $project_id,
    'token_key' =>!empty($token_key)?$token_key:''
  ));
}
      obiba_mica_app_angular_load_js_resources('obiba_mica_files');
    }

    drupal_set_title(obiba_mica_commons_get_localized_field($response, 'title'));

    drupal_set_breadcrumb(array(
      l(t('Home'), '<front>'),
      l($localize->getTranslation('research'), MicaClientPathProvider::RESEARCH_PROJECT),
      l(t('Approved Projects'), MicaClientPathProvider::RESEARCH_PROJECT_APPROVED),
    ));

    $project_theme ='';
    if (!empty($token_key)) {
      $project_link = obiba_mica_commons_get_draft_link('project', $project_id, $response->published);
      $project_theme .=  $project_link;
    }
    return $project_theme . theme('obiba_mica_research_project-detail-page', array(
      'draft_view' => !empty($token_key) ? TRUE : FALSE,
      'project' => $response,
      'model' => $model,
      'attachments' => !empty($themed_attachment) ? $themed_attachment : NULL,
      'file_browser' => !empty($file_browser)?$file_browser:NULL,
    ));
  }
  else{
    drupal_set_title('No Project Found');
    return '';
  }
}
