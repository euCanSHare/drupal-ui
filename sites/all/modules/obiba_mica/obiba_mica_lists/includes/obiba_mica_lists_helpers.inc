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
 * MicaListsHelper class
 */


class MicaListsHelper{

  const TARGET_STUDY = 'study';
  const TARGET_NETWORK = 'network';
  const TARGET_DATASET = 'dataset';
  const TARGET_VARIABLE = 'variable';

  static function studyFragment($type = NULL) {
    $study_sort = variable_get_value('study_list_name_acronym_sort');
    $study_order = (!empty(variable_get_value('study_list_default_order_sort') && variable_get_value('study_list_default_order_sort') == 'desc'))
    || ($study_sort == '_score') ? '-' : '';
    switch ($type) {
      case ANGULAR_LIST_STUDIES :
        return 'search?query=study(exists(Mica_study.id),sort(' . $study_order . variable_get_value('study_list_name_acronym_sort') . '))';
      case  ANGULAR_LIST_INDIVIDUAL_STUDIES :
        return 'search?query=study(in(Mica_study.className,Study),sort(' . $study_order . $study_sort . '))';
      case ANGULAR_LIST_HARMONIZATION_STUDIES :
        return 'search?query=study(in(Mica_study.className,HarmonizationStudy),sort(' . $study_order . ($study_sort !== "numberOfParticipants-participant-number" ? $study_sort : "name") . '))';
    }
  }

  static function networkFragment(){
    $network_sort = variable_get_value('network_list_default_field_sort');
    $network_order = (!empty(variable_get_value('network_list_default_order_sort') && variable_get_value('network_list_default_order_sort') == 'desc'))
      || $network_sort == '_score' ? '-' : '';
    return 'search?query=network(exists(Mica_network.id),sort(' . $network_order . $network_sort . '))';
  }

  static function datasetFragment($type = NULL){
    switch ($type) {
      case ANGULAR_LIST_DATASETS :
        return 'search?query=dataset(exists(Mica_dataset.id),sort(name))';
      case  ANGULAR_LIST_COLLECTED_DATASETS :
        return 'search?query=dataset(in(Mica_dataset.className,StudyDataset),sort(name))';
      case ANGULAR_LIST_HARMONIZED_DATASETS :
        return 'search?query=dataset(in(Mica_dataset.className,HarmonizationDataset),sort(name))';
    }
}
}