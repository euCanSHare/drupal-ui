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

(function () {
  function CriteriaNodeCompileService($templateCache, $compile) {
    return {
      compile: function (scope, element, templateUrl) {
        var template = '';
        if (scope.item.type === RQL_NODE.OR || scope.item.type === RQL_NODE.AND || scope.item.type === RQL_NODE.NAND || scope.item.type === RQL_NODE.NOR) {
          template = angular.element($templateCache.get(templateUrl));
        } else {
          template = angular.element('<criterion-dropdown criterion="item" query="query"></criterion-dropdown>');
        }

        if (scope.item.rqlQuery.args) {
          $compile(template)(scope, function (cloned) {
            element.replaceWith(cloned);
          });
        }
      }
    };
  }

  ngObibaMica.search.factory('CriteriaNodeCompileService', ['$templateCache', '$compile', CriteriaNodeCompileService]);
})();