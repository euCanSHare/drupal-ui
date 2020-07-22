'use strict';

ngObibaMica.search
  .controller('StringCriterionTermsController', [
    '$scope',
    'RqlQueryService',
    'LocalizedValues',
    'StringUtils',
    'JoinQuerySearchResource',
    'RqlQueryUtils',
    'SearchContext',
    '$filter',
    function ($scope,
      RqlQueryService,
      LocalizedValues,
      StringUtils,
      JoinQuerySearchResource,
      RqlQueryUtils,
      SearchContext,
      $filter) {
      $scope.lang = SearchContext.currentLocale();

      var isSelected = function (name) {
        return $scope.checkboxTerms.indexOf(name) !== -1;
      };

      var updateSelection = function () {
        $scope.state.dirty = true;
        $scope.criterion.rqlQuery.name = $scope.selectedFilter;
        var selected = [];
        if ($scope.selectedFilter !== RQL_NODE.MISSING && $scope.selectedFilter !== RQL_NODE.EXISTS) {
          Object.keys($scope.checkboxTerms).forEach(function (key) {
            if ($scope.checkboxTerms[key]) {
              selected.push(key);
            }
          });
        }
        if (selected.length === 0 && $scope.selectedFilter !== RQL_NODE.MISSING) {
          $scope.criterion.rqlQuery.name = RQL_NODE.EXISTS;
        }
        RqlQueryUtils.updateQuery($scope.criterion.rqlQuery, selected);
      };

      var updateFilter = function () {
        updateSelection();
      };

      var isInOutFilter = function () {
        return $scope.selectedFilter === RQL_NODE.IN || $scope.selectedFilter === RQL_NODE.OUT;
      };

      var isContainsFilter = function () {
        return $scope.selectedFilter === RQL_NODE.CONTAINS;
      };

      var onOpen = function () {
        $scope.state.loading = true;
        var target = $scope.criterion.target;
        var joinQuery = RqlQueryService.prepareCriteriaTermsQuery($scope.query, $scope.criterion, $scope.lang);

        JoinQuerySearchResource[targetToType(target)]({ query: joinQuery }).$promise.then(function (joinQueryResponse) {
          $scope.state.loading = false;
          $scope.terms = RqlQueryService.getTargetAggregations(joinQueryResponse, $scope.criterion, $scope.lang);

          if ($scope.terms) {
            if ($scope.criterion.taxonomy.name.startsWith('Mica_') && $scope.criterion.vocabulary.name === 'sets') {
              var vocTerms = $scope.criterion.vocabulary.terms;
              // ensure terms are local sets + titles from server are not correct
              $scope.terms = $scope.terms.filter(function(term) {
                var filteredVocTerms = vocTerms.filter(function(vocTerm) {
                  if (vocTerm.name === term.key) {
                    term.title = $scope.localize(vocTerm.title);
                    return true;
                  }
                  return false;
                });
                return filteredVocTerms.length>0;
              });
            }
            $scope.terms.forEach(function (term) {
              $scope.checkboxTerms[term.key] = $scope.isSelectedTerm(term);
            });
            $scope.terms = $filter('orderBySelection')($scope.terms, $scope.checkboxTerms);
          }
        });
      };

      $scope.isSelectedTerm = function (term) {
        return $scope.criterion.selectedTerms && $scope.criterion.selectedTerms.indexOf(term.key) !== -1;
      };

      $scope.state.addOnOpen(onOpen);
      $scope.checkboxTerms = {};
      $scope.RQL_NODE = RQL_NODE;
      $scope.selectedFilter = $scope.criterion.type;
      $scope.isSelected = isSelected;
      $scope.updateFilter = updateFilter;
      $scope.localize = function (values) {
        return LocalizedValues.forLocale(values, $scope.criterion.lang);
      };
      $scope.truncate = StringUtils.truncate;
      $scope.isInOutFilter = isInOutFilter;
      $scope.isContainsFilter = isContainsFilter;
      $scope.updateSelection = updateSelection;
    }])

  /**
   * Directive specialized for vocabulary of type String
   */
  .directive('stringCriterionTerms', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        criterion: '=',
        query: '=',
        state: '='
      },
      controller: 'StringCriterionTermsController',
      templateUrl: 'search/components/criteria/item-region/string-terms/component.html'
    };
  }]);