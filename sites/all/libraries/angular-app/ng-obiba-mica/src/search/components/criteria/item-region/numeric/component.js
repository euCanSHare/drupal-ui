'use strict';

ngObibaMica.search
  .controller('NumericCriterionController', [
    '$scope',
    'RqlQueryService',
    'LocalizedValues',
    'JoinQuerySearchResource',
    'RqlQueryUtils',
    'SearchContext',
    function ($scope, RqlQueryService, LocalizedValues, JoinQuerySearchResource, RqlQueryUtils, SearchContext) {
      $scope.lang = SearchContext.currentLocale();
      var range = $scope.criterion.rqlQuery.args[1];

      if (angular.isArray(range)) {
        $scope.from = $scope.criterion.rqlQuery.args[1][0];
        $scope.to = $scope.criterion.rqlQuery.args[1][1];
      } else {
        $scope.from = $scope.criterion.rqlQuery.name === RQL_NODE.GE ? range : null;
        $scope.to = $scope.criterion.rqlQuery.name === RQL_NODE.LE ? range : null;
      }

      var updateLimits = function () {
        var target = $scope.criterion.target,
          joinQuery = RqlQueryService.prepareCriteriaTermsQuery($scope.query, $scope.criterion);
        JoinQuerySearchResource[targetToType(target)]({ query: joinQuery }).$promise.then(function (joinQueryResponse) {
          var stats = RqlQueryService.getTargetAggregations(joinQueryResponse, $scope.criterion, $scope.lang);

          if (stats && stats.default) {
            $scope.min = stats.default.min;
            $scope.max = stats.default.max;
          }
        });
      };

      var onOpen = function () {
        updateLimits();
      };

      var onClose = function () {
        $scope.updateSelection();
      };

      $scope.updateSelection = function () {
        RqlQueryUtils.updateRangeQuery($scope.criterion.rqlQuery, $scope.from, $scope.to, $scope.selectMissing);
        $scope.state.dirty = true;
      };

      $scope.selectMissing = $scope.criterion.rqlQuery.name === RQL_NODE.MISSING;
      $scope.state.addOnClose(onClose);
      $scope.state.addOnOpen(onOpen);
      $scope.localize = function (values) {
        return LocalizedValues.forLocale(values, $scope.criterion.lang);
      };
    }])

  .directive('numericCriterion', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        criterion: '=',
        query: '=',
        state: '='
      },
      controller: 'NumericCriterionController',
      templateUrl: 'search/components/criteria/item-region/numeric/component.html'
    };
  }]);
