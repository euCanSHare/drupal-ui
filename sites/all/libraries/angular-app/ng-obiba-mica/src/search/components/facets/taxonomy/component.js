'use strict';

ngObibaMica.search
  .controller('TaxonomiesFacetsController', ['$scope',
    '$timeout',
    'TaxonomyResource',
    'TaxonomiesResource',
    'LocalizedValues',
    'ngObibaMicaSearch',
    'RqlQueryUtils',
    'VocabularyService',
    function ($scope,
      $timeout,
      TaxonomyResource,
      TaxonomiesResource,
      LocalizedValues,
      ngObibaMicaSearch,
      RqlQueryUtils,
      VocabularyService) {

      $scope.options = ngObibaMicaSearch.getOptions();
      $scope.taxonomies = {};
      $scope.targets = [];
      $scope.RqlQueryUtils = RqlQueryUtils;

      $scope.$watch('facetedTaxonomies', function (facetedTaxonomies) {
        if (facetedTaxonomies) {
          $scope.targets = $scope.options.targetTabsOrder.filter(function (t) {
            if (facetedTaxonomies[t]) {
              return facetedTaxonomies[t].length;
            }
          });

          $scope.target = $scope.targets[0];
          init($scope.target);
        }
      });

      $scope.selectTerm = function (target, taxonomy, vocabulary, args) {
        $scope.onSelectTerm(target, taxonomy, vocabulary, args);
      };

      $scope.setTarget = function (target) {
        $scope.target = target;
        init(target);
      };

      $scope.loadVocabulary = function (taxonomy, vocabulary) {
        $scope.$broadcast('ngObibaMicaLoadVocabulary', taxonomy, vocabulary);
      };

      $scope.localize = function (values) {
        return LocalizedValues.forLocale(values, $scope.lang);
      };

      function init(target) {
        if ($scope.taxonomies[target]) { return; }

        TaxonomiesResource.get({
          target: target
        }, function onSuccess(taxonomies) {
          $scope.taxonomies[target] = $scope.facetedTaxonomies[target].map(function (f) {
            return taxonomies.filter(function (t) {
              return f.name === t.name;
            })[0];
          }).filter(function (t) { return t; }).map(function (t) {
            t.isOpen = false;
            t.vocabularies = 'Maelstrom Research' === t.author ?
              t.vocabularies :
              VocabularyService.visibleFacetVocabularies(t.vocabularies);

            t.vocabularies.map(function (v) {
              var facetAttributes = VocabularyService.findVocabularyAttributes(v, /^facet/i);
              v.isOpen = 'true' === facetAttributes.facetExpanded;
              v.position = parseInt(facetAttributes.facetPosition);
              v.limit = 10;
              v.isMatch = VocabularyService.isMatchVocabulary(v);
              v.isNumeric = VocabularyService.isNumericVocabulary(v);

              t.isOpen = t.isOpen || v.isOpen;
            });

            return t;
          });

          if ($scope.taxonomies[target].length === 1) {
            $scope.taxonomies[target][0].isOpen = 1;
          }

          if ($scope.criteria) {
            $timeout(function () {
              $scope.$broadcast('ngObibaMicaQueryUpdated', $scope.criteria);
            });
          }
        });
      }

      $scope.$on('ngObibaMicaQueryUpdated', function (ev, criteria) {
        $scope.criteria = criteria;
      });
    }
  ])

  .directive('taxonomiesFacetsPanel', [function () {
    return {
      restrict: 'EA',
      scope: {
        facetedTaxonomies: '=',
        onRefresh: '=',
        onSelectTerm: '=',
        lang: '=',
        criteria: '='
      },
      controller: 'TaxonomiesFacetsController',
      templateUrl: 'search/components/facets/taxonomy/component.html'
    };
  }]);