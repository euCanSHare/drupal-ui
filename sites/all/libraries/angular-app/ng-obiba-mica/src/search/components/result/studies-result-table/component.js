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
  function StudiesResultTable($log, $q, $location,
    PageUrlService,
    ngObibaMicaSearch,
    TaxonomyResource,
    RqlQueryService,
    LocalizedValues,
    ngObibaMicaSearchTemplateUrl,
    StudyFilterShortcutService) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        lang: '=',
        summaries: '=',
        loading: '=',
        onUpdateCriteria: '='
      },
      templateUrl: ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchStudiesResultTable'),
      link: function (scope) {
        $q.all([
          TaxonomyResource.get({ target: 'study', taxonomy: 'Mica_study' }).$promise
        ]).then(function (data) {
          var taxonomy = data[0];
          scope.taxonomy = taxonomy;
          getDatasourceTitles();
          if (taxonomy.vocabularies) {
            scope.designs = taxonomy.vocabularies.filter(function (v) {
              return v.name === 'methods-design';
            })[0].terms.reduce(function (prev, t) {
              prev[t.name] = t.title.map(function (t) {
                return { lang: t.locale, value: t.text };
              });
              return prev;
            }, {});
          } else {
            $log.warn('Taxonomy has no vocabularies');
          }

          setInitialStudyFilterSelection();
        });

        scope.taxonomy = {};
        scope.designs = {};
        scope.datasourceTitles = {};
        scope.studyFilterSelection = {
          get selection() {
            return this._selection;
          },
          set selection(value) {
            this._selection = value;
            updateStudyClassNameFilter(value);
          }
        };

        scope.$on('$locationChangeSuccess', function () {
          setInitialStudyFilterSelection();
        });

        function updateStudyClassNameFilter(choice) {
          StudyFilterShortcutService.filter(choice, scope.lang);
        }

        function setInitialStudyFilterSelection() {
          var result = StudyFilterShortcutService.getStudyClassNameChoices();
          angular.extend(scope, result); // adds choseAll, choseIndividual and choseHarmonization functions
        }

        function getDatasourceTitles() {
          if (Object.keys(scope.taxonomy).length < 1 ||
            !scope.taxonomy.vocabularies ||
            Object.keys(scope.datasourceTitles).length > 0) {
            return;
          }

          scope.taxonomy.vocabularies.some(function (vocabulary) {
            if (vocabulary.name === 'populations-dataCollectionEvents-dataSources') {
              vocabulary.terms.forEach(function (term) {
                scope.datasourceTitles[term.name] = { title: LocalizedValues.forLocale(term.title, scope.lang) };
              });
              return true;
            }
            return false;
          });
        }

        scope.$watch('lang', getDatasourceTitles);

        scope.hasDatasource = function (datasources, id) {
          return datasources && datasources.indexOf(id) > -1;
        };

        var options = ngObibaMicaSearch.getOptions();
        scope.options = options.studies;
        scope.resultTabOrder = options.resultTabsOrder;
        scope.optionsCols = scope.options.studiesColumn;
        scope.PageUrlService = PageUrlService;

        scope.updateCriteria = function (id, type, destinationType) {
          var datasetClassName;
          if (type === 'HarmonizationDataset' || type === 'StudyDataset') {
            datasetClassName = type;
            type = 'datasets';
          }

          var stuydClassName;
          if (type === 'HarmonizationStudy' || type === 'Study') {
            stuydClassName = type;
            type = 'studies';
          }

          var variableType;
          if (type === 'DataschemaVariable' || type === 'CollectedVariable') {
            variableType = type.replace('Variable', '');
            type = 'variables';
          }

          type = destinationType ? destinationType : type;

          RqlQueryService.createCriteriaItem('study', 'Mica_study', 'id', id).then(function (item) {
            if (datasetClassName) {
              RqlQueryService.createCriteriaItem('dataset', 'Mica_dataset', 'className', datasetClassName).then(function (datasetItem) {
                scope.onUpdateCriteria(item, type);
                scope.onUpdateCriteria(datasetItem, type);
              });
            } else if (stuydClassName) {
              RqlQueryService.createCriteriaItem('study', 'Mica_study', 'className', stuydClassName).then(function (studyItem) {
                scope.onUpdateCriteria(item, type);
                scope.onUpdateCriteria(studyItem, type);
              });
            } else if (variableType) {
              RqlQueryService.createCriteriaItem('variable', 'Mica_variable', 'variableType', variableType).then(function (variableItem) {
                scope.onUpdateCriteria(item, type);
                scope.onUpdateCriteria(variableItem, type);
              });
            } else {
              scope.onUpdateCriteria(item, type);
            }
          });
        };
      }
    };
  }

  ngObibaMica.search.directive('studiesResultTable',
    [
      '$log',
      '$q',
      '$location',
      'PageUrlService',
      'ngObibaMicaSearch',
      'TaxonomyResource',
      'RqlQueryService',
      'LocalizedValues',
      'ngObibaMicaSearchTemplateUrl',
      'StudyFilterShortcutService',
      StudiesResultTable
    ]);
})();
