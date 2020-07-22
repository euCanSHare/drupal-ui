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

/* exported CRITERIA_ITEM_EVENT */
var CRITERIA_ITEM_EVENT = {
  deleted: 'event:delete-criteria-item',
  refresh: 'event:refresh-criteria-item'
};

(function () {  
  function CriteriaRootDirective() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        item: '=',
        query: '=',
        advanced: '=',
        onRemove: '=',
        onRefresh: '=',
        isFacetted: '='
      },
      templateUrl: 'search/components/criteria/criteria-root/component.html',
      link: function ($scope) {
        $scope.$on(CRITERIA_ITEM_EVENT.deleted, function (event, item) {
          $scope.onRemove(item);
        });

        $scope.$on(CRITERIA_ITEM_EVENT.refresh, function () {
          $scope.onRefresh();
        });
      }
    };
  }

  ngObibaMica.search.directive('criteriaRoot', CriteriaRootDirective);
})();
