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

ngObibaMica.lists

  .controller('listSearchWidgetController', ['$scope', '$rootScope', '$location', 'RqlQueryService', 'ngObibaMicaUrl',
    function ($scope, $rootScope, $location, RqlQueryService, ngObibaMicaUrl) {
      function initMatchInput() {
        $scope.query = $location.search().query;
        $scope.target = typeToTarget($scope.type);
        $scope.rqlQuery = RqlQueryService.parseQuery($scope.query);
      }

      /**
       * Removes all other query parts except the ID or className criterion
       *
       * @returns query urk
       */
      $scope.navigateToSearchPage = function() {
        var targetQuery =
          RqlQueryService.findTargetQuery(typeToTarget($scope.type), RqlQueryService.parseQuery($scope.query));

        if (targetQuery) {
          var query = RqlQueryService.findQueryInTargetByVocabulary(targetQuery, 'className') ||
            RqlQueryService.findQueryInTargetByVocabulary(targetQuery, 'id');
          if (query) {
            targetQuery.args = [query];
            var containerQuery = new RqlQuery(RQL_NODE.AND);
            containerQuery.args.push(targetQuery);
            return ngObibaMicaUrl.getUrl('BaseUrl') + ngObibaMicaUrl.getUrl('SearchBaseUrl') + '?type=' +
              $scope.type +
              '&query=' +
              (new RqlQuery().serializeArgs(containerQuery.args)) +
              '&display=list';
          }
        }

        return '';
      };

      $scope.$on('$locationChangeSuccess', function () {
        initMatchInput();
      });

      var emitter = $rootScope.$new();

      $scope.selectSuggestion = function (suggestion) {
        emitter.$emit('ngObibaMicaSearch.searchSuggestion', suggestion);
      };

      $scope.search = function() {
        emitter.$emit('ngObibaMicaSearch.searchSuggestion', $scope.searchFilter.replace(/\/.*/g, ''));
      };

      initMatchInput();
    }])
  .controller('listSortWidgetController', ['$scope', '$rootScope', 'sortWidgetService',
    function ($scope, $rootScope, sortWidgetService) {

      var emitter = $rootScope.$new();
      $scope.selectSortOrder = sortWidgetService.getSortOrderOptions();
      $scope.getLabel = sortWidgetService.getLabel;
      $scope.selected = $scope.selectSortOrder.options.defaultValue;
      initSelectedOptions();

      $scope.$on('$locationChangeSuccess', function () {
        initSelectedOptions();
      });

      $scope.selectSortOrderOption = function (option) {
        $scope.selected = option;
        emitter.$emit('ngObibaMicaSearch.sortChange', option.value);
      };

      function initSelectedOptions() {
        $scope.selected = sortWidgetService.getSortOrderOption(sortWidgetService.getSortArg());
      }
    }]);

})();
