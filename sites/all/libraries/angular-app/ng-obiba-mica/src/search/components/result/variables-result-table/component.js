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
  function VariablesResultTable(PageUrlService,
                                ngObibaMicaSearch,
                                VariableAnnotationsService,
                                SearchResultSelectionsService) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        lang: '=',
        summaries: '=',
        loading: '='
      },
      templateUrl: 'search/components/result/variables-result-table/component.html',
      link: function (scope) {
        scope.annotationsEnabled = VariableAnnotationsService.isAnnotationsEnabled();

        function setSummaries(summaries) {
          scope._summaries = summaries;

          if (summaries) {
            VariableAnnotationsService.processAnnotations(summaries).then(function () {
              scope._summaries = summaries;
            });
          }
        }

        scope.options = ngObibaMicaSearch.getOptions().variables;
        scope.populationColumn = scope.options.fields.indexOf('populationId') > -1;
        scope.dceColumn = scope.options.fields.indexOf('dceId') > -1;
        scope.optionsCols = scope.options.variablesColumn;
        scope.PageUrlService = PageUrlService;
        scope.__defineSetter__('summaries', setSummaries);
        scope.__defineGetter__('summaries', function() {return scope._summaries;});

        SearchResultSelectionsService.decorateSearchResult(QUERY_TYPES.VARIABLES, scope);
      }
    };
  }

  ngObibaMica.search.directive('variablesResultTable',
    ['PageUrlService', 'ngObibaMicaSearch', 'VariableAnnotationsService', 'SearchResultSelectionsService', VariablesResultTable]);
})();
