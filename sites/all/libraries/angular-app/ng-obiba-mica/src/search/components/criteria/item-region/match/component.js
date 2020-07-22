'use strict';

ngObibaMica.search
  .controller('MatchCriterionTermsController', [
    '$scope',
    'RqlQueryService',
    'LocalizedValues',
    'JoinQuerySearchResource',
    'RqlQueryUtils',
    'SearchContext',
    function ($scope, RqlQueryService, LocalizedValues, JoinQuerySearchResource, RqlQueryUtils, SearchContext) {
      $scope.lang = SearchContext.currentLocale();

      var update = function () {
        $scope.state.dirty = true;
        RqlQueryUtils.updateMatchQuery($scope.criterion.rqlQuery, $scope.match);
      };

      var queryString = $scope.criterion.rqlQuery.args[0];
      $scope.match = queryString === '*' ? '' : queryString;
      $scope.update = update;
      $scope.localize = function (values) {
        return LocalizedValues.forLocale(values, $scope.criterion.lang);
      };

    }])

  /**
   * Directive specialized for vocabulary of type String
   */
  .directive('matchCriterion', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        criterion: '=',
        query: '=',
        state: '='
      },
      controller: 'MatchCriterionTermsController',
      templateUrl: 'search/components/criteria/item-region/match/component.html'
    };
  }]);