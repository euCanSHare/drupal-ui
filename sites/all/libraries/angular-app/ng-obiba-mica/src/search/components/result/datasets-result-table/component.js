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
  function DatasetsResultTable($log,
    PageUrlService,
    ngObibaMicaSearch,
    TaxonomyResource,
    RqlQueryService,
    ngObibaMicaSearchTemplateUrl) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        lang: '=',
        summaries: '=',
        loading: '=',
        onUpdateCriteria: '='
      },
      templateUrl: ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchDatasetsResultTable'),
      link: function (scope) {
        scope.classNames = {};
        TaxonomyResource.get({
          target: 'dataset',
          taxonomy: 'Mica_dataset'
        }).$promise.then(function (taxonomy) {

          if (taxonomy.vocabularies) {
            scope.classNames = taxonomy.vocabularies.filter(function (v) {
              return v.name === 'className';
            })[0].terms.reduce(function (prev, t) {
              prev[t.name] = t.title.map(function (t) {
                return { lang: t.locale, value: t.text };
              });
              return prev;
            }, {});
          } else {
            $log.warn('Taxonomy has no vocabularies');
          }
        });

        scope.updateCriteria = function (id, type) {
          RqlQueryService.createCriteriaItem('dataset', 'Mica_dataset', 'id', id).then(function (item) {
            scope.onUpdateCriteria(item, type);
          });
        };

        var options = ngObibaMicaSearch.getOptions();
        scope.options = options.datasets;
        scope.resultTabOrder = options.resultTabsOrder;
        scope.optionsCols = scope.options.datasetsColumn;
        scope.PageUrlService = PageUrlService;
      }
    };
  }

  ngObibaMica.search.directive('datasetsResultTable',
    [
      '$log',
      'PageUrlService',
      'ngObibaMicaSearch',
      'TaxonomyResource',
      'RqlQueryService',
      'ngObibaMicaSearchTemplateUrl',
      DatasetsResultTable
    ]);
})();
