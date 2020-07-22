'use strict';

/* global BaseTaxonomiesController */

(function () {
  /**
  * TaxonomiesPanelController
  *
  * @param $rootScope
  * @param $scope
  * @param $translate
  * @param $location
  * @param TaxonomyResource
  * @param TaxonomiesResource
  * @param ngObibaMicaSearch
  * @param RqlQueryUtils
  * @param $cacheFactory
  * @param AlertService
  * @param ServerErrorUtils
  * @constructor
  */
  function TaxonomiesPanelController($rootScope,
    $scope,
    $translate,
    $location,
    TaxonomyResource,
    TaxonomiesResource,
    ngObibaMicaSearch,
    RqlQueryUtils,
    $cacheFactory,
    AlertService,
    ServerErrorUtils,
    VocabularyService) {
    BaseTaxonomiesController.call(this,
      $rootScope,
      $scope,
      $translate,
      $location,
      TaxonomyResource,
      TaxonomiesResource,
      ngObibaMicaSearch,
      RqlQueryUtils,
      $cacheFactory,
      VocabularyService);

    function getPanelTaxonomies(target, taxonomyName) {
      TaxonomyResource.get({
        target: target,
        taxonomy: taxonomyName
      }, function onSuccess(response) {
        $scope.taxonomies.taxonomy = response;
        $scope.taxonomies.vocabulary = null;
        $scope.taxonomies.term = null;
        $scope.taxonomies.search.active = false;
      }, function onError(response) {
        $scope.taxonomies.search.active = false;

        AlertService.alert({
          id: 'SearchController',
          type: 'danger',
          msg: ServerErrorUtils.buildMessage(response),
          delay: 5000
        });
      });
    }

    $scope.$watchGroup(['taxonomyName', 'target'], function (newVal) {
      if (newVal[0] && newVal[1]) {
        if ($scope.showTaxonomies) {
          $scope.showTaxonomies();
        }
        $scope.taxonomies.target = newVal[1];
        $scope.taxonomies.search.active = true;
        $scope.taxonomies.all = null;
        $scope.taxonomies.taxonomy = null;
        $scope.taxonomies.vocabulary = null;
        $scope.taxonomies.term = null;

        getPanelTaxonomies(newVal[1], newVal[0]);
      }
    });

    this.refreshTaxonomyCache = function (target, taxonomyName) {
      $scope.clearCache();
      getPanelTaxonomies(target, taxonomyName);
    };

    $scope.refreshTaxonomyCache = this.refreshTaxonomyCache;
  }

  ngObibaMica.search
    .controller('TaxonomiesPanelController', ['$rootScope',
      '$scope',
      '$translate',
      '$location',
      'TaxonomyResource',
      'TaxonomiesResource',
      'ngObibaMicaSearch',
      'RqlQueryUtils',
      '$cacheFactory',
      'AlertService',
      'ServerErrorUtils',
      'VocabularyService',
      TaxonomiesPanelController])

    .controller('NumericVocabularyPanelController', ['$scope', function ($scope) {
      $scope.$watch('taxonomies', function () {
        $scope.from = null;
        $scope.to = null;
      }, true);
    }])

    .controller('MatchVocabularyPanelController', ['$scope', function ($scope) {
      $scope.$watch('taxonomies', function () {
        $scope.text = null;
      }, true);
    }])

    .directive('taxonomiesPanel', [function () {
      return {
        restrict: 'EA',
        replace: true,
        scope: {
          taxonomyName: '=',
          target: '=',
          onClose: '=',
          onSelectTerm: '=',
          taxonomiesShown: '=',
          lang: '='
        },
        controller: 'TaxonomiesPanelController',
        templateUrl: 'search/components/panel/taxonomies-panel/component.html',
        link: function (scope, element) {
          scope.closeTaxonomies = function () {
            element.collapse('hide');
            scope.onClose();
          };

          scope.showTaxonomies = function () {
            element.collapse('show');
          };

          element.on('show.bs.collapse', function () {
            scope.taxonomiesShown = true;
          });

          element.on('hide.bs.collapse', function () {
            scope.taxonomiesShown = false;
          });

          scope.$watch('taxonomiesShown', function (value) {
            if (value) {
              element.collapse('show');
            } else {
              element.collapse('hide');
            }
          });

        }
      };
    }]);
})();