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
 * Code for the obiba_mica_app_angular modules.
 */

?>

<table class="table table-striped" ng-show="attachments.length">
  <tbody>
  <tr ng-repeat="attachment in attachments">
    <th>
      <a target="_self" ng-href="{{attachment.href}}"
        download="{{attachment.fileName}}">{{attachment.fileName}}
      </a>
    </th>
    <td>
      {{attachment.size | bytes}}
    </td>
  </tr>
  </tbody>
</table>
