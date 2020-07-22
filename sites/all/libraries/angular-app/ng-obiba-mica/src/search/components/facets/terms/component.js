'use strict';

/* global CriteriaIdGenerator */

ngObibaMica.search
  .controller('TermsVocabularyFacetController', ['$scope', '$filter', 'JoinQuerySearchResource', 'RqlQueryService',
    'RqlQueryUtils',
    function ($scope, $filter, JoinQuerySearchResource, RqlQueryService, RqlQueryUtils) {
      function isSelectedTerm(criterion, term) {
        return criterion.selectedTerms && (criterion.rqlQuery.name === RQL_NODE.EXISTS || criterion.selectedTerms.indexOf(term.key) !== -1);
      }

      $scope.loading = false;
      $scope.selectTerm = function (target, taxonomy, vocabulary, args) {
        var selected = vocabulary.terms.filter(function (t) { return t.selected; }).map(function (t) { return t.name; }),
          criterion = RqlQueryService.findCriterion($scope.criteria, CriteriaIdGenerator.generate(taxonomy, vocabulary));

        if (criterion) {
          if (selected.length === 0) {
            RqlQueryService.removeCriteriaItem(criterion);
          } else {
            criterion.rqlQuery.name = RQL_NODE.IN;
            RqlQueryUtils.updateQuery(criterion.rqlQuery, selected);
          }

          $scope.onRefresh();
        } else {
          $scope.onSelectTerm(target, taxonomy, vocabulary, args);
        }
      };

      function updateCounts(criteria, vocabulary) {
        var query = null, isCriterionPresent = false;
        $scope.loading = true;

        function createExistsQuery(criteria, criterion) {
          var rootQuery = angular.copy(criteria.rqlQuery);
          criterion.rqlQuery = RqlQueryUtils.buildRqlQuery(criterion);
          RqlQueryService.addCriteriaItem(rootQuery, criterion);
          return rootQuery;
        }

        var criterion = RqlQueryService.findCriterion(criteria,
          CriteriaIdGenerator.generate($scope.$parent.taxonomy, vocabulary));

        if (criterion) {
          isCriterionPresent = true;
        } else {
          criterion = RqlQueryService.createCriteriaItem($scope.target, $scope.$parent.taxonomy, $scope.vocabulary);
        }

        if (RqlQueryUtils.hasTargetQuery(criteria.rqlQuery, criterion.target)) {
          query = angular.copy(criteria.rqlQuery);

          if (!isCriterionPresent) {
            var operator = criterion.target === QUERY_TARGETS.VARIABLE && criterion.taxonomy.name !== 'Mica_variable' ?
              RQL_NODE.OR :
              RQL_NODE.AND;

            RqlQueryService.addCriteriaItem(query, criterion, operator);
          }
        } else {
          query = createExistsQuery(criteria, criterion);
        }

        var joinQuery = RqlQueryService.prepareCriteriaTermsQuery(query, criterion, criterion.lang);
        JoinQuerySearchResource[targetToType($scope.target)]({ query: joinQuery }).$promise.then(function (joinQueryResponse) {
          $scope.vocabulary.visibleTerms = 0;
          RqlQueryService.getTargetAggregations(joinQueryResponse, criterion, criterion.lang).forEach(function (term) {
            $scope.vocabulary.terms.some(function (t) {
              if (t.name === term.key) {
                t.selected = isSelectedTerm(criterion, term);
                t.count = term.count;
                t.isVisible = $scope.options.showFacetTermsWithZeroCount || term.count > 0;
                $scope.vocabulary.visibleTerms += t.isVisible;
                return true;
              }
            });
          });
          $scope.loading = false;
        });
      }

      $scope.$on('ngObibaMicaQueryUpdated', function (ev, criteria) {
        if (!$scope.vocabulary.isNumeric && !$scope.vocabulary.isMatch && $scope.vocabulary.isOpen) {
          updateCounts(criteria, $scope.vocabulary);
        }
      });

      $scope.$on('ngObibaMicaLoadVocabulary', function (ev, taxonomy, vocabulary) {
        if (vocabulary.name === $scope.vocabulary.name && !$scope.vocabulary.isNumeric && !$scope.vocabulary.isMatch &&
          !vocabulary.isOpen) {
          updateCounts($scope.criteria, vocabulary);
        }
      });
    }]);