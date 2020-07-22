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

<button type="button" class="btn btn-primary btn-xs" aria-hidden="true" ngf-select ngf-change="onFileSelect($files)"
  translate>file.upload.button
</button>

<table ng-show="files.length" class="table table-striped">
  <tbody>
  <tr ng-repeat="file in files">
    <td>
      <progressbar ng-show="file.showProgressBar" class="progress-striped" value="file.progress">
        {{file.progress}}%
      </progressbar>
    </td>
    <td>
      {{file.fileName}}
    </td>
    <td>
      {{file.size | bytes}}
    </td>
    <td>
      <a ng-show="file.id" ng-click="deleteFile(file.id)" class="action">
        <i class="fa fa-trash-o fa-lg"></i>
      </a>
      <a ng-show="file.tempId" ng-click="deleteTempFile(file.tempId)" class="action">
        <i class="fa fa-trash-o"></i>
      </a>
    </td>
  </tr>
  </tbody>
</table>
