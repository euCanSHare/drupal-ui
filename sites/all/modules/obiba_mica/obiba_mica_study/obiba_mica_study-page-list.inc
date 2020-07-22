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
 * Mica client studies retrieve Studies lists
 */

/**
 * Format column study table depending in studies type
 */
function obiba_mica_study_study_table_column($row, $type, $config_table) {
  switch ($type) {
    case DrupalMicaStudyResource::HARMONIZATION_STUDY:
      array_splice($row, 2, -1);
      if(!variable_get_value($config_table)){
        array_splice($row, -1, 1);
      }
      return $row;
      break;
    default:
      if(!variable_get_value($config_table)){
        array_splice($row, -1, 1);
      }
      return $row;
  }
}


function obiba_mica_study_study_summaries_table_headers($study_type = DrupalMicaStudyResource::INDIVIDUAL_STUDY, $display_variable) {
  $localize = obiba_mica_commons_mica_server_localisation();
  $header = array(
    array(
      "title" => $localize->getTranslation('study.acronym'),
      'width' => '15%'
    ),
    array("title" => $localize->getTranslation('study.name'), 'width' => '40%'),
    array(
      "title" => $localize->getTranslation('search.study.design'),
      'width' => '10%'
    ),
    array(
      "title" => $localize->getTranslation('search.study.participants'),
      'width' => '10%'
    ),
    array(
      "title" => $localize->getTranslation('address.country'),
      'width' => '10%'
    ),
    array("title" => $localize->getTranslation('variables'), 'width' => '5%')
  );
  return obiba_mica_study_study_table_column($header, $study_type, $display_variable);
}

function obiba_mica_study_study_summaries_table_row($study_summaries, $id_entity = NULL, $study_type = DrupalMicaStudyResource::INDIVIDUAL_STUDY, $query = NULL, $display_variable = NULL) {
  $rows = NULL;
  $cached_studies_rows = obiba_mica_commons_get_cache('cached' . __FUNCTION__ . $id_entity . '_' . $study_type);
  if (!empty($cached_studies_rows)) {
    return $cached_studies_rows;
  }
  else {
    if (!empty($study_summaries)) {
      $localize = obiba_mica_commons_mica_server_localisation();
      $get_resource_path = function($study_type){
        $reource = array(
          DrupalMicaStudyResource::HARMONIZATION_STUDY => DrupalMicaStudyResource::HARMONIZATION_STUDY,
          DrupalMicaStudyResource::INDIVIDUAL_STUDY => DrupalMicaStudyResource::INDIVIDUAL_STUDY
        );
        return $reource[$study_type];
      };
      foreach ($study_summaries as $study_summary) {
        $content = json_decode($study_summary->content);
        //TODO The studyResourcePath it may be 'harmonization-study' if harmonized study
        if ($study_summary->studyResourcePath === $get_resource_path($study_type)) {
          $name = obiba_mica_commons_get_localized_field($study_summary, 'name');
          $row = array(
            DrupalMicaStudyResource::anchorStudy($study_summary),
            $name,
            isset($study_summary->design) ? obiba_mica_study_translate_study_design_summary($study_summary->design) : '',
            !empty($study_summary->targetNumber->noLimit) && $study_summary->targetNumber->noLimit === TRUE ? $localize->getTranslation('numberOfParticipants.no-limit') :
              ((isset($study_summary->targetNumber->number) && isset($content->numberOfParticipants->participant->number)) ? obiba_mica_commons_format_number($study_summary->targetNumber->number) : NULL),
            isset($study_summary->countries) ? obiba_mica_commons_countries($study_summary->countries) : NULL,
            empty($study_summary->variables)
              ? '-' : MicaClientAnchorHelper::studyVariables(obiba_mica_commons_format_number($study_summary->variables), $study_summary->id, array(), $query)
          );
          $rows[] = obiba_mica_study_study_table_column($row, $study_type, $display_variable);
        }
      }
    }
    obiba_mica_commons_set_cache('cached' . __FUNCTION__ . $id_entity . '_' . $study_type, $rows);
    return $rows;
  }
}

