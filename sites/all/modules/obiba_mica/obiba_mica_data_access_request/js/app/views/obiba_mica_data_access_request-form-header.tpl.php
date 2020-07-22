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

<div>
  <h3 class="page-header">
    <a href="{{getDataAccessListPageUrl}}#/data-access-requests" title="<?php print obiba_mica_data_access_request_dar_title_callback(); ?>">
      <i class="glyphicon glyphicon-chevron-left"></i>
    </a>
   <span ng-if="newRequest" translate>new-data-access-request</span>
    <span ng-if="!newRequest">
      <?php print t('Edit') . ' ' . variable_get_value('access_request_page_title'); ?>: {{requestId}}
    </span>
  </h3>

</div>
