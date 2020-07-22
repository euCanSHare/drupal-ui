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
 * Code for the obiba_mica_data_access_request modules.
 */

?>
<!--
  ~ Copyright (c) 2015 OBiBa. All rights reserved.
  ~
  ~ This program and the accompanying materials
  ~ are made available under the terms of the GNU Public License v3.0.
  ~
  ~ You should have received a copy of the GNU General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<?php print render($node_content); ?>

<?php if ($data_access_register_user) : ?>
  <p class="md-top-margin">
    <?php print t('You need to be authenticated to start an application') ?>
    <?php if (empty(variable_get_value('access_signup_button_disabled')) || !variable_get_value('access_signup_button_disabled')): ?>
    <?php print l(variable_get_value('access_signup_button'), MicaClientPathProvider::AGATE_REGISTER . '/',
      array(
        'attributes' => array('class' => 'btn btn-info'),
        'fragment' => 'join',
      )) ?>
    <?php endif; ?>
    <?php print l(variable_get_value('access_signin_button'), 'user/login', array(
      'query' => array('destination' => MicaClientPathProvider::DATA_ACCESS_HOME),
      'attributes' => array(
        'class' => 'btn btn-default',
      ),
    )) ?>
  </p>
<?php endif; ?>

<?php if ($data_access_list_display) : ?>
  <p class="md-top-margin text-center">
    <?php
    $can_access = obiba_mica_data_access_request_user_permission(MicaDataAccessRequest::LIST_DATA_ACCESS);
    ?>
    <?php if ($can_access) : ?>
      <?php
      print l(obiba_mica_data_access_request_dar_title_callback(), MicaClientPathProvider::DATA_ACCESS_LIST,
        array(
          'attributes' => array('class' => array('btn', 'btn-primary')),
          'fragment' => 'data-access-requests',
        )
      ); ?>
    <?php endif; ?>
    <?php
    $can_create_access = obiba_mica_data_access_request_user_permission(MicaDataAccessRequest::NEW_DATA_ACCESS);
    ?>
    <?php if ($can_create_access) : ?>
      <?php
      print l('<i class="fa fa-plus"></i> ' . variable_get_value('access_new_request_button'), MicaClientPathProvider::DATA_ACCESS_LIST,
        array(
          'attributes' => array('class' => array('btn', 'btn-info', 'indent')),
          'fragment' => 'data-access-request/new',
          'html' => TRUE,
        )
      ); ?>
    <?php endif; ?>
  </p>
<?php endif; ?>
