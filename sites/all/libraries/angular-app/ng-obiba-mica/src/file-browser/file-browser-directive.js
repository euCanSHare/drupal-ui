/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

ngObibaMica.fileBrowser
  
  .directive('fileBrowser', [function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: 'FileBrowserController',
      scope: {
        docPath: '@',
        docId: '@',
        tokenKey: '@',
        subject: '=',
        refresh: '=',
        showTitle: '@'
      },
      templateUrl: 'file-browser/views/file-browser-template.html',
      link: function (scope, elem) {
        scope.selfNode = elem[0];
      }
    };
  }]);
