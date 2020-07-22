'use strict';

/* global CriteriaIdGenerator */

ngObibaMica.search
  .controller('NumericVocabularyFacetController', ['$scope', 'JoinQuerySearchResource', 'RqlQueryService',
    'RqlQueryUtils', function ($scope, JoinQuerySearchResource, RqlQueryService, RqlQueryUtils) {
      function updateLimits(criteria, vocabulary) {
        function createExistsQuery(criteria, criterion) {
          var rootQuery = angular.copy(criteria.rqlQuery);
          criterion.rqlQuery = RqlQueryUtils.buildRqlQuery(criterion);
          RqlQueryService.addCriteriaItem(rootQuery, criterion);
          return rootQuery;
        }

        var criterion = RqlQueryService.findCriterion(criteria, CriteriaIdGenerator.generate($scope.$parent.taxonomy, vocabulary));

        if (!criterion) {
          criterion = RqlQueryService.createCriteriaItem($scope.target, $scope.$parent.taxonomy, $scope.vocabulary);
        }

        if (criterion.rqlQuery && criterion.rqlQuery.args[1]) {
          if (angular.isArray(criterion.rqlQuery.args[1])) {
            $scope.from = criterion.rqlQuery.args[1][0];
            $scope.to = criterion.rqlQuery.args[1][1];
          } else {
            if (criterion.rqlQuery.name === RQL_NODE.GE) {
              $scope.from = criterion.rqlQuery.args[1];
            } else {
              $scope.to = criterion.rqlQuery.args[1];
            }
          }
        } else {
          $scope.from = null;
          $scope.to = null;
          $scope.min = null;
          $scope.max = null;
        }

        var query = RqlQueryUtils.hasTargetQuery(criteria.rqlQuery, criterion.target) ? angular.copy(criteria.rqlQuery) : createExistsQuery(criteria, criterion);
        var joinQuery = RqlQueryService.prepareCriteriaTermsQuery(query, criterion);
        JoinQuerySearchResource[targetToType($scope.target)]({ query: joinQuery }).$promise.then(function (joinQueryResponse) {
          var stats = RqlQueryService.getTargetAggregations(joinQueryResponse, criterion, $scope.lang);

          if (stats && stats.default) {
            $scope.min = stats.default.min;
            $scope.max = stats.default.max;
          }
        });
      }

      function updateCriteria() {
        $scope.$parent.selectTerm($scope.$parent.target, $scope.$parent.taxonomy, $scope.vocabulary, { from: $scope.from, to: $scope.to });
      }

      $scope.onKeypress = function (ev) {
        if (ev.keyCode === 13 || ev.type === 'click') { updateCriteria(); }
      };

      $scope.$on('ngObibaMicaQueryUpdated', function (ev, criteria) {
        if ($scope.vocabulary.isNumeric && $scope.vocabulary.isOpen) {
          updateLimits(criteria, $scope.vocabulary);
        }
      });

      $scope.$on('ngObibaMicaLoadVocabulary', function (ev, taxonomy, vocabulary) {
        if ($scope.vocabulary.isNumeric &&
          vocabulary.name === $scope.vocabulary.name && !vocabulary.isOpen) {
          updateLimits($scope.criteria, vocabulary);
        }
      });
    }]);