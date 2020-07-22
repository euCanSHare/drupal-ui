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

ngObibaMica.lists
  .directive('listSortWidget', [function () {
    return {
      restrict: 'EA',
      controller: 'listSortWidgetController',
      templateUrl: 'lists/views/sort-widget/sort-widget-template.html'
    };
  }])
  .directive('listSearchWidget', ['ngObibaMicaSearchTemplateUrl', function (ngObibaMicaSearchTemplateUrl) {
    return {
      restrict: 'EA',
      require: '^^suggestionField',
      transclude: true,
      replace: true,
      scope: {
        type: '='
      },
      controller: 'listSearchWidgetController',
      templateUrl: ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchInputList')
    };
  }])

  .directive('suggestionField', ['$location', 'DocumentSuggestionResource', '$translate', 'RqlQueryService', 'EntitySuggestionService',
    function ($location, DocumentSuggestionResource, $translate, RqlQueryService, EntitySuggestionService) {
      return {
        restrict: 'EA',
        replace: true,
        scope: {
          documentType: '=',
          model: '=',
          placeholderText: '=',
          select: '='
        },
        templateUrl: 'lists/views/input-search-widget/suggestion-field.html',
        link: function (scope) {
          scope.suggest = function (query) {
            return EntitySuggestionService.suggestForTargetQuery(scope.documentType, query);
          };
        }
      };
    }]
  );