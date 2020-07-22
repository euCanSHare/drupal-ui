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

function obiba_mica_research_project_admin_settings(&$form){
  $form['content_display_settings']['research_project_form'] = array(
    '#type' => 'fieldset',
    '#title' => t('Research Project Content'),
    '#collapsible' => FALSE,
  );

  _obiba_mica_research_project_content_page_settings($form);
  _obiba_mica_research_project_list_page_settings($form);
  _obiba_mica_research_approved_project_list_page_settings($form);

}

function _obiba_mica_research_project_content_page_settings(&$form){
  $form['content_display_settings']['research_project_form']['research_project_content_page'] = array(
    '#type' => 'fieldset',
    '#title' => t('Research Project Content page'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('project_research_menu_title');
  $form['content_display_settings']['research_project_form']['research_project_content_page']['project_research_menu_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('project_research_menu_title'),
    '#description' => $info['description']
  );

}

function _obiba_mica_research_project_list_page_settings(&$form){
  $form['content_display_settings']['research_project_form']['research_project_list_page'] = array(
    '#type' => 'fieldset',
    '#title' => t('Research Project list page'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('data_access_request_my_research_projects_title');
  $form['content_display_settings']['research_project_form']['research_project_list_page']['data_access_request_my_research_projects_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('data_access_request_my_research_projects_title'),
    '#description' => $info['description']
  );

  $info = variable_get_info('project_empty_label');
  $form['content_display_settings']['research_project_form']['research_project_list_page']['project_empty_label'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('project_empty_label'),
    '#description' => $info['description']
  );

  $info = variable_get_info('dar_research_project_list_start_date');
  $form['content_display_settings']['research_project_form']['research_project_list_page']['dar_research_project_list_start_date'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dar_research_project_list_start_date'),
    '#description' => $info['description']
  );
  $info = variable_get_info('dar_research_project_list_end_date');
  $form['content_display_settings']['research_project_form']['research_project_list_page']['dar_research_project_list_end_date'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('dar_research_project_list_end_date'),
    '#description' => $info['description']
  );
}

function _obiba_mica_research_approved_project_list_page_settings(&$form){
  $form['content_display_settings']['research_project_form']['research_approved_project_list_page'] = array(
    '#type' => 'fieldset',
    '#title' => t('Research Approved Project list page'),
    '#collapsible' => FALSE,
  );

  $info = variable_get_info('project_approved_page_title');
  $form['content_display_settings']['research_project_form']['research_approved_project_list_page']['project_approved_page_title'] = array(
    '#type' => 'textfield',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('project_approved_page_title'),
    '#description' => $info['description']
  );

  $info = variable_get_info('project_approved_list_show_count_caption');
  $form['content_display_settings']['research_project_form']['research_approved_project_list_page']['project_approved_list_show_count_caption'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('project_approved_list_show_count_caption'),
    '#description' => $info['description'],
  );

  $info = variable_get_info('project_approved_list_show_search_form');
  $form['content_display_settings']['research_project_form']['research_approved_project_list_page']['project_approved_list_show_search_form'] = array(
    '#type' => 'checkbox',
    '#title' => $info['title'],
    '#default_value' => variable_get_value('project_approved_list_show_search_form'),
    '#description' => $info['description'],
  );

}
