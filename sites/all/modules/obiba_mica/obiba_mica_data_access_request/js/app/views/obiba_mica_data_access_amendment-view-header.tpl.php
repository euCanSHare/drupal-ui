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

<div>
  <h3 class="page-header">
    <a href="{{getDataAccessListPageUrl}}#/data-access-request/{{requestEntity['obiba.mica.DataAccessAmendmentDto.amendment'].parentId}}" title="<?php print variable_get_value('access_request_page_title'); ?>">
      <i class="glyphicon glyphicon-chevron-left"></i>
    </a>
     <span translate>data-access-amendment.title</span> : {{requestEntity.id}}
  </h3>

</div>
