<?php
/**
 * Implements hook_variable_info().
 */
function obiba_mica_sets_variable_info($variable) {
  $variable['help_text_cart_page'] = array(
    'title' => t('Cart help text'),
    'description' => t('Help text to display on the cart page.'),
    'type' => 'string',
    'default' => 'Use the cart to make a list of variables. This list can be analyzed or can be viewed in the search page.',
  );

  $variable['help_text_sets_page'] = array(
    'title' => t('List help text'),
    'description' => t('Help text to display on the list page.'),
    'type' => 'string',
    'default' => 'Make one or more lists. Each list can be analyzed or can be viewed in the search page.',
  );

  return $variable;
}