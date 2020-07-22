<?php

/**
 * @file
 * template.php
 */


use Obiba\ObibaMicaClient\MicaClient\DrupalMicaClient as DrupalMicaClient;

/**
 * Implements hook_theme().
 *
 * Hook to override default theme pages
 * copy '<modules>/obiba_mica_study/templates/' files in current theme
 * 'templates/' path, you can modify default display of listed page by
 * rearrange block field, don't forget to clear the theme registry.
 */
function obiba_bootstrap_theme($existing, $type, $theme, $path) {
  $theme_array = array();

  $destination_path = file_exists($path . '/templates/obiba_mica_study-list-page.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study_list-page'] = array(
      'template' => 'obiba_mica_study-list-page',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study-list-page-block.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study-list-page-block'] = array(
      'template' => 'obiba_mica_study-list-page-block',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study_search.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study_search'] = array(
      'template' => 'obiba_mica_study_search',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study_detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study_detail'] = array(
      'template' => 'obiba_mica_study_detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/mica_population_detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['mica_population_detail'] = array(
      'template' => 'mica_population_detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study-dce-detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['mica_dce_detail'] = array(
      'template' => 'mica_dce_detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study-contact-detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['mica_contact_detail'] = array(
      'template' => 'mica_contact_detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study_attachments.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study_attachments'] = array(
      'template' => 'obiba_mica_study_attachments',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study_block_search.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study_block_search'] = array(
      'template' => 'obiba_mica_study_block_search',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_dataset-detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_dataset-detail'] = array(
      'template' => 'obiba_mica_dataset-detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_dataset-tables.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_dataset-tables'] = array(
      'template' => 'obiba_mica_dataset-tables',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_dataset-harmonization-table-legend.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_dataset-harmonization-table-legend'] = array(
      'template' => 'obiba_mica_dataset-harmonization-table-legend',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/block--obiba_mica_search.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['block__obiba_mica_search'] = array(
      'variables' => array('block' => array()),
      'template' => 'block--obiba_mica_search',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_search.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_search'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_search',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_coverage.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_coverage'] = array(
      'template' => 'obiba_mica_search_coverage',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_coverage_taxonomy.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_coverage_taxonomy'] = array(
      'template' => 'obiba_mica_search_coverage_taxonomy',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_vocabulary_coverage.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_vocabulary_coverage'] = array(
      'template' => 'obiba_mica_search_vocabulary_coverage',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_input_text_range.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_input_text_range'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_input_text_range',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_checkbox_term.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_checkbox_term'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_checkbox_term',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_tab_block.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_tab_block'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_tab_block',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_charts.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_charts'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_charts',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_vocabulary_charts.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_vocabulary_charts'] = array(
      'template' => 'obiba_mica_search_vocabulary_charts',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_network-detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_network-detail'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_network-detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_network-list-page-block.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_network-list-page-block'] = array(
      'template' => 'obiba_mica_network-list-page-block',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_network-list.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_network-list'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_network-list',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_fixed_sidebar.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_fixed_sidebar'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_fixed_sidebar',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_study_fixed_sidebar.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_study_fixed_sidebar'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_study_fixed_sidebar',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_variable_harmonization_algorithm.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_variable_harmonization_algorithm'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_variable_harmonization_algorithm',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_variable-detail.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_variable-detail'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_variable-detail',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_cloned_block.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_cloned_block'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_cloned_block',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_mica_search_aggregation_group.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_search_aggregation_group'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_search_aggregation_group',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/user-login.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['user_login'] = array(
      'template' => 'user-login',
      'path' => $path . '/templates',
      'render element' => 'form',
      'preprocess functions' => array(
        'obiba_bootstrap_preprocess_user_login',
      ),
    );
  }

  $destination_path = file_exists($path . '/templates/user-register-form.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['user_register_form'] = array(
      'template' => 'user-register-form',
      'path' => $path . '/templates',
      'render element' => 'form',
      'preprocess functions' => array(
        'obiba_bootstrap_preprocess_user_register_form',
      ),
    );
  }
  $destination_path = file_exists($path . '/templates/user-pass.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['user_pass'] = array(
      'template' => 'user-pass',
      'path' => $path . '/templates',
      'render element' => 'form',
      'preprocess functions' => array(
        'obiba_bootstrap_preprocess_user_pass',
      ),
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_agate-user-profile-register-form.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_agate-user-profile-register-form'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_agate-user-profile-register-form',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_agate_user-form-password-confirm.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_agate_user-form-password-confirm'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_agate_user-form-password-confirm',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_agate_user-form-password-reset.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_agate_user-form-password-reset'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_agate_user-form-password-reset',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/obiba_agate_user-pass-request-form.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_agate_user-pass-request-form'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_agate_user-pass-request-form',
      'path' => $path . '/templates',
    );
  }
  $destination_path = file_exists($path . '/templates/obiba_mica_data_access_request-page-data-access.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_data_access_request-page-data-access'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_data_access_request-page-data-access',
      'path' => $path . '/templates',
    );
  }
  $destination_path = file_exists($path . '/templates/obiba_mica_data_access_request-list.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_data_access_request-list'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_data_access_request-list',
      'path' => $path . '/templates',
    );
  }

  $destination_path = file_exists($path . '/templates/views/obiba_mica_data_access_request-form-page.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_data_access_request-form-page'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_data_access_request-form-page',
      'path' => $path . '/templates/views',
    );
  }
  $destination_path = file_exists($path . '/templates/views/obiba_mica_data_access_request-view-page.tpl.php');
  if (!empty($destination_path)) {
    $theme_array['obiba_mica_data_access_request-view-page'] = array(
      'variables' => array('block' => array()),
      'template' => 'obiba_mica_data_access_request-view-page',
      'path' => $path . '/templates/views',
    );
  }
  return $theme_array;

}

/**
 * Implements hook_bootstrap_based_theme().
 */
function obiba_bootstrap_bootstrap_based_theme() {
  return array('obiba_bootstrap' => TRUE);
}

/**
 * Implements hook_preprocess_html().
 */
function obiba_bootstrap_preprocess_html(&$variables) {
  $cdn_setting = theme_get_setting('bootstrap_cdn_provider', 'obiba_bootstrap');
  if (empty($cdn_setting)) {
    drupal_add_css('https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,300,700,700italic', array('type' => 'external'));
  }
}

function obiba_bootstrap_get_letter_from_item_path($key_item, $current_item){
  switch ($current_item[$key_item]){
    case strstr($current_item[$key_item], 'network'):
      return 'N';
    case strstr($current_item[$key_item], 'individual-study'):
    case strstr($current_item[$key_item], 'harmonization-study'):
      return 'S';
    case strstr($current_item[$key_item], 'collected-dataset'):
      return 'D';
    case strstr($current_item[$key_item], 'harmonized-dataset'):
      return 'D-h';
    case strstr($current_item[$key_item], 'repository'):
    case strstr($current_item[$key_item], 'analysis'):
    case strstr($current_item[$key_item], 'cart'):
    case strstr($current_item[$key_item], 'sets'):
      return 'search-icon';
    case strstr($current_item[$key_item], 'research'):
    case strstr($current_item[$key_item], 'project'):
    return 'project';
  }
  return FALSE;
}
/**
 * Return the first letter in current path page.
 *
 * @return null|string
 *   The first letter.
 */
function obiba_bootstrap_letters_badge_title() {
  $current_item = explode('/', current_path());
  if (!empty($current_item[0]) && $current_item[0] != 'mica') {
    return NULL;
  }

  if(!empty($current_item[2])){
    $class = obiba_bootstrap_get_letter_from_item_path(2, $current_item);
    if($class){
      return $class;
    }
  }
  if (!empty($current_item[1])) {
    $class = obiba_bootstrap_get_letter_from_item_path(1, $current_item);
    if($class){
      return $class;
    }
  }

  return drupal_strtoupper(drupal_substr($current_item[1], 0, 1));
}

/**
 * Implements hook_preprocess_page().
 *
 * @see page.tpl.php
 */
function obiba_bootstrap_preprocess_page(&$variables) {
  // Add badge letter.
  $first_letter_title = obiba_bootstrap_letters_badge_title();
  if (!empty($first_letter_title)) {
    $variables['classes_array']['title_page'] = $first_letter_title;
  }

  // If cdn provider not set use local js bootstrap not used in production
  $cdn_setting = theme_get_setting('bootstrap_cdn_provider', 'obiba_bootstrap');
  if (empty($cdn_setting)) {
    drupal_add_js(drupal_get_path('theme', 'obiba_bootstrap') . '/bootstrap/js/bootstrap.js');
  }
  // Add information about the number of sidebars.
  elseif (!empty($variables['page']['sidebar_first']) && !empty($variables['page']['sidebar_second'])) {
    $variables['content_column_class'] = ' class="col-sm-6"';
  }
  elseif (!empty($variables['page']['sidebar_first']) || !empty($variables['page']['sidebar_second'])) {
    $variables['content_column_class'] = ' class="col-sm-8 col-lg-9"';
  }

  else {
    $variables['content_column_class'] = ' class="col-sm-12"';
  }
  if (empty($variables['logged_in'])) {
    // Hide tabs user menu if not logged user.
    unset($variables['tabs']);
  }
  $variables['profile_path'] = obiba_bootstrap_get_user_profile_page();
  $variables['content_lang_switch'] = obiba_bootstrap_get_lang_switch();
  $variables['cart_enabled'] = obiba_bootstrap_get_cart_option();

}

function obiba_bootstrap_get_cart_option() {
  $configs = (new DrupalMicaClient\MicaClientConfigResource())->getAllConfig();
  if(module_exists('obiba_mica_sets') && is_object($configs) && !empty($configs->currentUserCanCreateCart) && $configs->currentUserCanCreateCart){
    // TEMPORARY FIX until the Cart counter becomes a component and the Angular App gets loaded correctly
    $jsScripts = drupal_get_js('footer');
    if (!strstr($jsScripts, 'angular-app')) {
      obiba_mica_app_angular_load_js_resources('obiba_mica_sets');
    }
    return $configs->currentUserCanCreateCart;
  }
  return FALSE;
}

/**
 * Return the user profile page if Obiba Agate enabled.
 *
 * @return string
 *   The Profile path.
 */
function obiba_bootstrap_get_user_profile_page() {
  global $user;
  if (!empty($user->name)) {
    $user_authmaps = user_get_authmaps($user->name);
    return (module_exists('obiba_agate') &&
      (!empty($user_authmaps['obiba_agate']) &&
        $user_authmaps['obiba_agate'] == $user->name)) ? 'agate/user/profile/' : 'user';
  }
}

/**
 * Overrides theme_menu_local_action().
 */
function obiba_bootstrap_menu_local_action($variables) {
  $link = $variables['element']['#link'];

  $options = isset($link['localized_options']) ? $link['localized_options'] : array();

  // If the title is not HTML, sanitize it.
  if (empty($options['html'])) {
    $link['title'] = check_plain($link['title']);
  }

  $icon = is_array($link['title']) ? _bootstrap_iconize_button($link['title']) : '';

  // Format the action link.
  $output = '<li>';
  if (isset($link['href'])) {
    // Turn link into a mini-button and colorize based on title.
    if ($class = $icon) {
      if (!isset($options['attributes']['class'])) {
        $options['attributes']['class'] = array();
      }
      $string = is_string($options['attributes']['class']);
      if ($string) {
        $options['attributes']['class'] = explode(' ', $options['attributes']['class']);
      }
      $options['attributes']['class'][] = 'btn';
      // $options['attributes']['class'][] = 'btn-xs';
      $options['attributes']['class'][] = $class;
      if ($string) {
        $options['attributes']['class'] = implode(' ', $options['attributes']['class']);
      }
    }
    // Force HTML so we can add the icon rendering element.
    $options['html'] = TRUE;
    $output .= l($icon . $link['title'], $link['href'], $options);
  }
  else {
    $output .= $icon . $link['title'];
  }
  $output .= "</li>\n";

  return $output;
}

function obiba_bootstrap_get_lang_switch(){
  global $language;
  $lang_name = $language->language;
  if(module_exists('locale')) {
    $path = drupal_is_front_page() ? '<front>' : $_GET['q'];
    drupal_add_js(drupal_get_path('theme', 'obiba_bootstrap') . '/js/obiba-bootstrap-rewrite-switch-lang-links.js');
    drupal_add_js(array('hrefLanWrapper'=> array(
      'path'=> $path)), 'setting');
    $enabled_languages = language_list($field = 'language');
    if (count($enabled_languages) > 1) {
      $div_menu = '<li class="expanded dropdown">';
      $div_menu .= '<a data-target="#" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="true">'
                     . $lang_name .
                     '<span class="caret"></span>
                    </a>';
      $links = language_negotiation_get_switch_links('language_url', $path);
      $div_menu .= '<ul class="dropdown-menu">';
      foreach ($links->links as $key_lang => $link) {
        $trans_url = url(drupal_get_path_alias($link['href']), array('language' => language_list()[$key_lang]));
        if ($lang_name != $key_lang) {
          $div_menu .= '<li  class="expanded dropdown">';
          $div_menu .= '<a href="' . $trans_url . '" class="fragment-link-place-holder">' . $link['language']->language . '</a>';
          $div_menu .= '</li>';
        }
      }
      $div_menu .= '</ul></li>';
      return $div_menu;
    }
  }
  return FALSE;
}
