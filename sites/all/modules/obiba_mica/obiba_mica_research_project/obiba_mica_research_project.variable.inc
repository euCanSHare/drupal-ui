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
 * Implements hook_variable_info().
 */

function obiba_mica_research_project_variable_info($options) {
  $variable['project_approved_page_title'] = array(
    'title' => t('Approved Projects list page title'),
    'description' => 'The list page of the approved research projects',
    'type' => 'string',
    'default' => 'Approved Projects'
  );
  $variable['project_research_menu_title'] = array(
    'title' => t('Research Project menu label'),
    'description' => 'Menu label of the list of approved research projects',
    'type' => 'string',
    'default' => 'Research'
  );
  $variable['project_empty_label'] = array(
    'title' => t('No project label'),
    'description' => t('Text to be displayed when no network is found.'),
    'type' => 'string',
    'default' => 'No project found'
  );
  $variable['data_access_request_my_research_projects_title'] = array(
    'title' => t('My Research Projects'),
    'description' => t('A list of research projects linked to the corresponding data access request (if any).'),
    'type' => 'string',
    'default' => 'My Research Projects'
  );
  $variable['project_approved_list_show_count_caption'] = array(
    'title' => t('Show the Approved Projects count caption in the Research Approved Projects list page'),
    'description' => t('If selected the Projects count caption will be displayed in the Research Approved Projects list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['project_approved_list_show_search_form'] = array(
    'title' => t('Show the search projects form in the Research Approved Projects list page'),
    'description' => t('If selected the rapid search/sort form will be displayed in the Research Approved Projects list page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['dar_research_project_list_start_date'] = array(
    'title' => t('The start date label in DAR Research Projects list page'),
    'description' => t('The text to be displayed as a Start Date label in DAR Research Projects list page'),
    'type' => 'string',
    'default' => 'Start Date',
  );
  $variable['dar_research_project_list_end_date'] = array(
    'title' => t('The end date label in DAR Research Projects list page'),
    'description' => t('The text to be displayed as a End Date label in DAR Research Projects list page'),
    'type' => 'string',
    'default' => 'End Date',
  );
  return $variable;
}
