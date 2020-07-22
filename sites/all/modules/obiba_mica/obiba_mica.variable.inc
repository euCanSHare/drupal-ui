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
 * Obiba Mica variable file
 */

/**
 * Implements hook_variable_info().
 */
function obiba_mica_variable_info($options) {
  _obiba_mica_variable_info_mica_server($variable);
  if (module_exists('obiba_mica_data_access_request')) {
    _obiba_mica_variable_info_access($variable);
  }
  if (module_exists('obiba_mica_analysis')) {
    _obiba_mica_variable_analysis($variable);
  }
  _obiba_mica_variable_search_page($variable);
  _obiba_mica_variable_search_networks($variable);
  _obiba_mica_variable_search_studies($variable);
  _obiba_mica_variable_search_datasets($variable);
  _obiba_mica_variable_search_variables($variable);
  _obiba_mica_variable_network_content($variable);

  $variable['mica_taxonomy_figures'] = array(
    'title' => t('Taxonomy in figures filter'),
    'description' => t('List of the taxonomies that will be displayed as Variable Classification figures in the network, study and dataset pages. If none is enabled, no figures will be displayed.'),
    'type' => 'string',
    'default' => '',
    'placeholder' => 'e.g. Mlstr_area',
  );

  $variable['mica_disable_translation'] = array(
    'title' => t('Disable translation'),
    'description' => t('Disable translation in selected pages.'),
    'type' => 'boolean',
    'default' => '',
  );

  $variable['mica_disabled_path_translation'] = array(
    'title' => t('Disable translation for paths'),
    'description' => t('List of page paths for which translation is disabled (separated by comma).'),
    'type' => 'boolean',
    'default' => '',
  );

  $variable['obiba_mica_enable_scroll_up'] = array(
    'title' => t('Enable the Scroll Up widget'),
    'description' => t('Here you can enable/disable the scroll up widget, depending on if it is present in the enabled Drupal template'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['mica_search_show_copy_query'] = array(
    'title' => t('Enable the Copy Query button'),
    'description' => t('Here you can enable/disable the Copy Query button in the query builder'),
    'type' => 'boolean',
    'default' => TRUE,
  );

  $variable['mica_target_tabs_order'] = array(
    'title' => t('Taxonomy targets order'),
    'description' => t('List of taxonomy targets (case sensitive, comma separated) determining their order of appearance in the search and classification pages. Values should be: variable, dataset, study, network.'),
    'type' => 'string',
    'default' => 'variable, dataset, study, network',
    'placeholder' => 'e.g. variable, dataset, study, network',
  );

  $variable['taxonomy_panel_fields_to_filter_description'] = array(
    'title' => t('Filter by terms\' description'),
    'description' => t('The terms will be filtered by description.'),
    'type' => 'boolean',
    'default' => FALSE,
  );
  $variable['taxonomy_panel_fields_to_filter_keywords'] = array(
    'title' => t('Filter by terms\' keywords'),
    'description' => t('The terms will be filtered by keywords'),
    'type' => 'boolean',
    'default' => FALSE,
  );

  $variable['mica_variable_taxonomies_order'] = array(
      'title' => t('Variable taxonomy facets order'),
      'description' => t('List of taxonomies that will be displayed as facets in the search page. If none is enabled, no taxonomy facet will be displayed.'),
      'type' => 'string',
  );

  $variable['mica_dataset_taxonomy_facet'] = array(
      'title' => t('Show dataset taxonomy as facet'),
      'description' => t('If selected the dataset taxonomy will be displayed as a block of facets on the left.'),
      'type' => 'boolean',
      'default' => FALSE,
  );

  $variable['mica_study_taxonomy_facet'] = array(
      'title' => t('Show study taxonomy as facet'),
      'description' => t('If selected the study taxonomy will be displayed as a block of facets on the left.'),
      'type' => 'boolean',
      'default' => FALSE,
  );

  $variable['mica_network_taxonomy_facet'] = array(
      'title' => t('Show network taxonomy as facet'),
      'description' => t('If selected the network taxonomy will be displayed as a block of facets on the left.'),
      'type' => 'boolean',
      'default' => FALSE,
  );

  $variable['mica_search_tabs_order'] = array(
    'title' => t('Result types order'),
    'description' => t('List of result types (case sensitive, comma separated) determining their order of appearance in the result section of the search page. If omitted, a result type will not be shown. Values should be: graphics, list, coverage.'),
    'type' => 'string',
    'default' => 'list, coverage, graphics',
    'placeholder' => 'e.g. list, coverage, graphics'
  );

  $variable['mica_result_tabs_order'] = array(
    'title' => t('List result targets order'),
    'description' => t('List of target names (case sensitive, comma separated) determining their order of appearance in the list result region of the search page. Values should be: variable, dataset, study, network.'),
    'type' => 'string',
    'default' => 'variable, dataset, study, network',
    'placeholder' => 'e.g. variable, dataset, study, network'
  );

  return $variable;
}

/**
 * Setting Variable search page.
 */
function _obiba_mica_variable_search_page(&$variable) {
  $variable['help_text_search_page'] = array(
    'title' => t('Search help text'),
    'description' => t('Help text to display on the search page.'),
    'type' => 'string',
    'default' => '<p><i class="fa fa-info-circle"></i> The search page allows to browse catalogued information such as partner networks, studies, datasets and variables.</p>
                    <span class="anon-only">
                    <p>
                    <i class="fa fa-shopping-cart fa-lg"></i> 
                    To save your variable search results, please <a href="{{basePath}}user/login" class="redirection-place-holder btn btn-success btn-xs">log in</a> 
                    or <a href="{{basePath}}agate/register#join" class="redirection-place-holder btn btn-success btn-xs">register</a>
                    <span>. Note that this feature is only available in the variable list.</span>
                    </p></span>
                    <span class="logged-in"><p><i class="fa fa-shopping-cart fa-lg"></i> 
                    You are logged in and can save your variable search results. Note that this feature is only available in the variable list.</p></span>
                    ',
  );

  $variable['help_text_harmonization_potential_page'] = array(
    'title' => t('Classification help text'),
    'description' => t('Help text to display on the variable classification page'),
    'type' => 'string',
    'default' => '<i class="fa fa-info-circle"></i> The classifications page allows to browse the classification system applied to the partner networks, studies, datasets and variables.',
  );

  $variable['help_link_label'] = array(
    'title' => t('Help link label'),
    'description' => t('The label of the link to the search help page.'),
    'type' => 'string',
    'default' => 'Help',
  );

  $variable['help_link_url'] = array(
    'title' => t('Help link url'),
    'description' => t('The url of the link to the search help page. If no url is specified, the link will not be shown.'),
    'type' => 'string',
    'default' => NULL,
  );

  $variable['search_page_title'] = array(
    'title' => t('Menu and page title'),
    'description' => t('Title of the menu and of the search page.'),
    'type' => 'string',
    'default' => 'Search',
  );

  $variable['mica_show_search_box'] = array(
      'title' => t('Show search box'),
      'description' => t('Show search input box (make sure you have also set taxonomies as facets).'),
      'type' => 'boolean',
      'default' => TRUE,
  );

  $variable['mica_show_search_browser'] = array(
      'title' => t('Show search taxonomies browser'),
      'description' => t('Show search taxonomies browser (the list of links under the search box).'),
      'type' => 'boolean',
      'default' => TRUE,
  );

  $variable['default_query_search'] = array(
    'title' => t('Default query search'),
    'description' => t('The default search query performed from the Search menu, for instance a query that shows all the studies: ') . '<code>query=study(exists(Mica_study.id))&type=studies</code>',
    'type' => 'string',
    'default' => '',
  );

  $variable['coverage_group_by'] = array(
    'title' => t('Coverage group-by'),
    'description' => t('Please select the group-by criteria for the coverage. Be advised that for Data Collection Event, Study must be checked in order to be shown.'),
    'type' => 'options',
    'default' => array(
      'study' => 'study',
      'dce' => 'dce',
      'dataset' => 'dataset'
    ),
  );
}

/**
 * Setting Variable search page.
 */
function _obiba_mica_variable_info_mica_server(&$variable) {
  $variable['mica_url'] = array(
    'title' => t('Mica address'),
    'description' => t('URL of the Mica server. Example: https://mica.example.org:8445'),
    'type' => 'string',
    'default' => 'https://localhost:8445',
  );
  $variable['mica_anonymous_name'] = array(
    'title' => t('Anonymous user name'),
    'description' => t('The name under which an anonymous user is known by Mica.'),
    'type' => 'string',
    'default' => 'anonymous',
  );
  $variable['mica_anonymous_password'] = array(
    'title' => t('Anonymous user password'),
    'description' => t('The password used by the Drupal server when issuing requests to Mica.'),
    'type' => 'string',
    'default' => 'password',
  );
  $variable['mica_copyright_notice'] = array(
    'title' => t('Copyright notice text'),
    'description' => t('Copyright notice displayed in the site and downloaded documents.'),
    'type' => 'string',
    'default' => '',
  );
  $variable['mica_response_page_size'] = array(
    'title' => t('Number of items per server response page'),
    'description' => t('Determines the how many items that must be displayed in a server response page.'),
    'type' => 'number',
    'default' => 20,
  );
  $variable['mica_response_page_size_small'] = array(
    'title' => t('Minimum number of items per server response page'),
    'description' => t('Determines the minimum number of items that must to be displayed in a server response page.'),
    'type' => 'number',
    'default' => 10,
  );
  $variable['mica_enable_to_mica_server_link'] = array(
    'title' => t('Mica Server Admin Button.'),
    'description' => t('Display a Button link to Mica Server Admin'),
    'type' => 'boolean',
    'default' => 1,
  );
  $variable['mica_allowed_xss_filtered_tag'] = array(
    'title' => t('The allowed tags filtered by drupal xss filter'),
    'description' => t('Tags separated by comma \',\''),
    'type' => 'string',
    'default' => 'a,em,strong,cite,blockquote,code,ul,ol,li,dl,dt,dd,a,abbr,acronym,address,b,bdo,big,blockquote,br,caption,cite,code,col,colgroup,del,dfn,div,h1,h2,h3,h4,h5,h6,hr,i,ins,kbd,li,ol,p,pre,q,samp,small,span,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,tt,ul,var',
  );
}

/**
 * Analysis module variables.
 */
function _obiba_mica_variable_analysis(&$variable) {
  $variable['entities_count_page_title'] = array(
    'title' => t('Entities count title'),
    'description' => t('Entities count analysis title.'),
    'type' => 'string',
    'default' => 'Entities Count',
  );
}

/**
 * Setting Variable access page.
 */
function _obiba_mica_variable_info_access(&$variable) {
  $variable['access_home_page_title'] = array(
    'title' => t('Home Page title'),
    'description' => t('Data Access home page title.'),
    'type' => 'string',
    'default' => 'Data Access Process',
  );
  $variable['access_requests_page_title'] = array(
    'title' => t('Requests Page title'),
    'description' => t('Data Access requests page title.'),
    'type' => 'string',
    'default' => 'Data Access Requests',
  );
  $variable['access_request_page_title'] = array(
    'title' => t('Request Page title'),
    'description' => t('Data Access request page title.'),
    'type' => 'string',
    'default' => 'Data Access Request',
  );
  $variable['access_request_my_page_title'] = array(
    'title' => t('My Requests Page title'),
    'description' => t('My Data Access request page title.'),
    'type' => 'string',
    'default' => 'My Data Access Requests'
  );
  $variable['access_my_requests_button'] = array(
    'title' => t('My requests button'),
    'description' => t('Data access my requests button caption.'),
    'type' => 'string',
    'default' => 'My Data Access Requests',
  );
  $variable['access_new_request_button'] = array(
    'title' => t('New request button'),
    'description' => t('Data access new request button caption.'),
    'type' => 'string',
    'default' => 'New Data Access Request',
  );
  $variable['access_new_request_button_info'] = array(
    'title' => t('New request button help text'),
    'description' => t('Data access new request button help text.'),
    'type' => 'string',
    'default' => 'New request button help text'
  );
  $variable['access_documents_section_title'] = array(
    'title' => t('Documents section title'),
    'description' => t('Data access request "Documents" section title.'),
    'type' => 'string',
    'default' => 'Additional Documents',
  );

  $variable['access_documents_section_help_text'] = array(
    'title' => t('Documents section help text'),
    'description' => t('Data access request "Documents" section help text.'),
    'type' => 'string',
    'default' => 'Select one or more documents to be attached to the data access request.',
  );
  $variable['access_download_button'] = array(
    'title' => t('Download button caption'),
    'description' => t('Data access download button caption.'),
    'type' => 'string',
    'default' => 'Download PDF',
  );
  $variable['access_comments_enabled'] = array(
    'title' => t('Enable commenting'),
    'description' => t('If checked, data access request commenting is enabled.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['user_list_page_title'] = array(
    'title' => t('Registered users list page'),
    'description' => t('The list registered users title page.'),
    'type' => 'string',
    'default' => 'Registered Users',
  );
}

/**
 * Setting Variable search page networks.
 */
function _obiba_mica_variable_search_networks(&$variable) {
  $variable['networks_list_page_size'] = array(
    'title' => t('Default networks list page size'),
    'description' => t('Number of results to be displayed on each list query.'),
    'type' => 'select',
    'options' => array(
      10 => '10',
      20 => '20',
      50 => '50',
      100 => '100',
    ),
    'default' => '20',
  );
  $variable['networks_column_studies'] = array(
    'title' => t('Show studies'),
    'description' => t('Show studies column in the networks table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['networks_column_study_datasets'] = array(
    'title' => t('Show studies dataset'),
    'description' => t('Show studies dataset column in the networks table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['networks_column_harmonization_datasets'] = array(
    'title' => t('Show harmonized dataset'),
    'description' => t('Show harmonized dataset column in the networks table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['networks_column_variables'] = array(
    'title' => t('Show variables'),
    'description' => t('Show variables column in the networks table.'),
    'type' => 'boolean',
    'default' => FALSE,
  );
  $variable['networks_column_study_variables'] = array(
      'title' => t('Show study variables'),
      'description' => t('Show study variables column in the networks table.'),
      'type' => 'boolean',
      'default' => TRUE,
  );
  $variable['networks_column_dataschema_variables'] = array(
      'title' => t('Show dataschema variables'),
      'description' => t('Show dataschema variables column in the networks table.'),
      'type' => 'boolean',
      'default' => TRUE,
  );
  $variable['networks_search_label'] = array(
    'title' => t('Networks search label'),
    'description' => t('Text to be displayed in links to network search.'),
    'type' => 'string',
    'default' => 'Search Networks',
  );
  $variable['networks_empty_label'] = array(
    'title' => t('No network label'),
    'description' => t('Text to be displayed when no network is found.'),
    'type' => 'string',
    'default' => 'No network found',
  );
}

/**
 * Setting Variable search page studies.
 */
function _obiba_mica_variable_search_studies(&$variable) {
  $variable['studies_list_page_size'] = array(
    'title' => t('Default studies list page size'),
    'description' => t('Number of results to be displayed on each list query.'),
    'type' => 'select',
    'options' => array(
      10 => '10',
      20 => '20',
      50 => '50',
      100 => '100',
    ),
    'default' => '20',
  );
  $variable['studies_facet_search'] = array(
    'title' => t('Show studies search filter'),
    'description' => t('If selected, the studies search filters tab will be displayed.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_type'] = array(
    'title' => t('Show type'),
    'description' => t('Show type column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_design'] = array(
    'title' => t('Show design'),
    'description' => t('Show design column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_questionnaire'] = array(
    'title' => t('Show questionnaires'),
    'description' => t('Show questionnaires column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_pm'] = array(
    'title' => t('Show physical measures'),
    'description' => t('Show physical measures column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_bio'] = array(
    'title' => t('Show biological samples'),
    'description' => t('Show biological samples column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_other'] = array(
    'title' => t('Show other data sources'),
    'description' => t('Show other data sources column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_participants'] = array(
    'title' => t('Show participants'),
    'description' => t('Show participants column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_networks'] = array(
    'title' => t('Show networks'),
    'description' => t('Show networks column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_study_datasets'] = array(
    'title' => t('Show collected datasets'),
    'description' => t('Show collected datasets column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_harmonization_datasets'] = array(
    'title' => t('Show harmonized datasets'),
    'description' => t('Show harmonized dataset column in the studies table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['studies_column_variables'] = array(
    'title' => t('Show variables'),
    'description' => t('Show variables column in the studies table.'),
    'type' => 'boolean',
    'default' => FALSE,
  );
  $variable['studies_column_study_variables'] = array(
      'title' => t('Show study variables'),
      'description' => t('Show study variables column in the studies table.'),
      'type' => 'boolean',
      'default' => TRUE,
  );
  $variable['studies_column_dataschema_variables'] = array(
      'title' => t('Show dataschema variables'),
      'description' => t('Show dataschema variables column in the studies table.'),
      'type' => 'boolean',
      'default' => TRUE,
  );
  $variable['studies_search_label'] = array(
    'title' => t('Studies search label'),
    'description' => t('Text to be displayed in links to study search.'),
    'type' => 'string',
    'default' => 'Search Studies',
  );
  $variable['search_studies_dce_autocomplete'] = array(
    'title' => t('Show Data Collection Event auto-complete search filter'),
    'description' => t('If selected, the auto-complete search filter will be displayed in the search page.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['search_general_population_sources_autocomplete'] = array(
    'title' => t('Show General Population Sources search filter'),
    'description' => t('If selected, the search filter will be displayed in the search page.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
}

/**
 * Setting Variable content page network.
 */
function _obiba_mica_variable_network_content(&$variable) {

  $variable['network_detail_show_search_button'] = array(
    'title' => t('Show the search variables button in the network page'),
    'description' => t('If selected the search variables button will be displayed in the network page'),
    'type' => 'boolean',
    'default' => TRUE,
  );
}

/**
 * Setting Variable search page datasets.
 */
function _obiba_mica_variable_search_datasets(&$variable) {
  $variable['datasets_list_page_size'] = array(
    'title' => t('Default datasets list page size'),
    'description' => t('Number of results to be displayed on each list query.'),
    'type' => 'select',
    'options' => array(
      10 => '10',
      20 => '20',
      50 => '50',
      100 => '100',
    ),
    'default' => '20',
  );
  $variable['datasets_column_acronym'] = array(
      'title' => t('Show acronym'),
      'description' => t('Show acronym column in the datasets table.'),
      'type' => 'boolean',
      'default' => TRUE,
  );
  $variable['datasets_column_type'] = array(
    'title' => t('Show type'),
    'description' => t('Show type column in the datasets table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['datasets_column_networks'] = array(
    'title' => t('Show networks'),
    'description' => t('Show networks column in the datasets table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['datasets_column_studies'] = array(
    'title' => t('Show studies'),
    'description' => t('Show studies column in the datasets table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['datasets_column_variables'] = array(
    'title' => t('Show variables'),
    'description' => t('Show variables column in the datasets table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['datasets_search_label'] = array(
    'title' => t('Datasets search label'),
    'description' => t('Text to be displayed in links to dataset search.'),
    'type' => 'string',
    'default' => t('Search Datasets'),
  );
  $variable['datasets_empty_label'] = array(
    'title' => t('No dataset label'),
    'description' => t('Text to be displayed when no dataset is found.'),
    'type' => 'string',
    'default' => t('No dataset found'),
  );
  $variable['search_datasets_autocomplete'] = array(
    'title' => t('Show dataset auto-complete search filter'),
    'description' => t('If selected, the auto-complete search filter will be displayed in the search page.'),
    'type' => 'number',
    'default' => ObibaDatasetConstants::FACET_TYPE_AUTOCOMPLETE,
  );
}

/**
 * Setting Variable search page variables.
 */
function _obiba_mica_variable_search_variables(&$variable) {
  $variable['variables_list_page_size'] = array(
    'title' => t('Default variables list page size'),
    'description' => t('Number of results to be displayed on each list query.'),
    'type' => 'select',
    'options' => array(
      10 => '10',
      20 => '20',
      50 => '50',
      100 => '100',
    ),
    'default' => '20',
  );
  $variable['variables_column_type'] = array(
    'title' => t('Show type'),
    'description' => t('Show type column in the variables table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['variables_column_study'] = array(
    'title' => t('Show study'),
    'description' => t('Show study column in the variables table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['variables_column_dataset'] = array(
    'title' => t('Show dataset'),
    'description' => t('Show dataset column in the variables table.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
  $variable['variable_coverage_label'] = array(
    'title' => t('Variable classification label'),
    'description' => t('Text to be displayed in links to variable classification.'),
    'type' => 'string',
    'default' => 'Variables Classification',
  );
  $variable['variables_search_label'] = array(
    'title' => t('Variables search label'),
    'description' => t('Text to be displayed in links to variable search.'),
    'type' => 'string',
    'default' => 'Search Variables',
  );
  $variable['variables_empty_label'] = array(
    'title' => t('No variable label'),
    'description' => t('Text to be displayed when no variable is found.'),
    'type' => 'string',
    'default' => 'No variable found',
  );
  $variable['variables_empty_coverage_label'] = array(
    'title' => t('No variable coverage label'),
    'description' => t('Text to be displayed when no variable coverage is found.'),
    'type' => 'string',
    'default' => 'Select some variable search criteria to see their corresponding coverage',
  );
  $variable['variables_strict_coverage'] = array(
    'title' => t('Strict variable coverage'),
    'description' => t('Get the variable classification coverage strictly: only report the variable counts for the corresponding search criteria.'),
    'type' => 'boolean',
    'default' => TRUE,
  );
}
