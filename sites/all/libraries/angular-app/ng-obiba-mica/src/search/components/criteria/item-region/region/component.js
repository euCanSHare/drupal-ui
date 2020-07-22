'use strict';

ngObibaMica.search
  .controller('searchCriteriaRegionController', ['$scope', 'RqlQueryService', '$timeout', function ($scope, RqlQueryService, $timeout) {
    var canShow = false;

    $scope.$watchCollection('search.criteria', function () {
      $scope.renderableTargets = RqlQueryService.getRenderableTargetCriteriaFromRoot($scope.search.criteria);
    });

    $scope.$watchCollection('search.criteriaItemMap', function () {
      if ($scope.search.criteriaItemMap) {
        canShow = Object.keys($scope.search.criteriaItemMap).length > 1;
      }
    });

    $scope.$watchCollection('search.rqlQuery', function () {
      var rqlQuery = RqlQueryService.cleanQuery(angular.copy($scope.search.rqlQuery));
      $scope.query = new RqlQuery().serializeArgs(rqlQuery.args);
    });

    var canShowCriteriaRegion = function () {
      return ($scope.options.studyTaxonomiesOrder.length || $scope.options.datasetTaxonomiesOrder.length || $scope.options.networkTaxonomiesOrder.length) && canShow;
    };

    $scope.showCopiedQueryTooltipStatus = false;
    var showCopiedQueryTooltip = function () {
      $scope.showCopiedQueryTooltipStatus = true;
      $timeout(function () {
        $scope.showCopiedQueryTooltipStatus = false;
      }, 1000);
    };

    $scope.showCopiedQueryTooltip = showCopiedQueryTooltip;
    $scope.canShowCriteriaRegion = canShowCriteriaRegion;
  }])

  .directive('searchCriteriaRegion', ['ngObibaMicaSearchTemplateUrl', function (ngObibaMicaSearchTemplateUrl) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        options: '=',
        search: '='
      },
      controller: 'searchCriteriaRegionController',
      templateUrl: ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchCriteriaRegionTemplate')
    };
  }]);