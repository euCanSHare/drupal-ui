'use strict';

/* global DISPLAY_TYPES */

ngObibaMica.search
  .controller('SearchResultController', [
    '$scope',
    'ngObibaMicaSearch',
    'ngObibaMicaUrl',
    'RqlQueryService',
    'RqlQueryUtils',
    'ngObibaMicaSearchTemplateUrl',
    'AlertService',
    'SetService',
    'SearchResultSelectionsService',
    '$uibModal',
    '$timeout',
    function ($scope,
              ngObibaMicaSearch,
              ngObibaMicaUrl,
              RqlQueryService,
              RqlQueryUtils,
              ngObibaMicaSearchTemplateUrl,
              AlertService,
              SetService,
              SearchResultSelectionsService,
              $uibModal,
              $timeout) {

      function updateType(type) {
        Object.keys($scope.activeTarget).forEach(function (key) {
          $scope.activeTarget[key].active = type === key;
        });
      }

      function rewriteQueryWithLimitAndFields(limit, fields) {
        var parsedQuery = RqlQueryService.parseQuery($scope.query);
        var target = typeToTarget($scope.type);

        return RqlQueryUtils.rewriteQueryWithLimitAndFields(parsedQuery, target, limit, fields);
      }


      $scope.targetTypeMap = $scope.$parent.taxonomyTypeMap;
      $scope.QUERY_TARGETS = QUERY_TARGETS;
      $scope.QUERY_TYPES = QUERY_TYPES;
      $scope.options = ngObibaMicaSearch.getOptions();
      $scope.activeTarget = {};
      $scope.activeTarget[QUERY_TYPES.VARIABLES] = {active: false, name: QUERY_TARGETS.VARIABLE};
      $scope.activeTarget[QUERY_TYPES.DATASETS] = {active: false, name: QUERY_TARGETS.DATASET};
      $scope.activeTarget[QUERY_TYPES.STUDIES] = {active: false, name: QUERY_TARGETS.STUDY};
      $scope.activeTarget[QUERY_TYPES.NETWORKS] = {active: false, name: QUERY_TARGETS.NETWORK};


      $scope.getUrlTemplate = function (tab) {
        switch (tab) {
          case 'list':
            return ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchResultList');
          case 'coverage':
            return ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchResultCoverage');
          case 'graphics':
            return ngObibaMicaSearchTemplateUrl.getTemplateUrl('searchResultGraphics');
        }
      };

      $scope.selectType = function (type) {
        updateType(type);
        $scope.type = type;
        $scope.$parent.onTypeChanged(type);
      };

      $scope.getTotalHits = function (type) {
        if (!$scope.result.list || !$scope.result.list[type + 'ResultDto']) {
          return '...';
        }
        return $scope.result.list[type + 'ResultDto'].totalHits;
      };

      $scope.getSelectionsReportUrl = function () {
        // TODO remove condition when all document page have selections
        if (QUERY_TYPES.VARIABLES !== $scope.type) {
          return $scope.getReportUrl();
        }

        const rql = RqlQueryUtils.createSelectionsQuery(
          RqlQueryService.parseQuery($scope.query),
          typeToTarget($scope.type),
          100000,
          null,
          SearchResultSelectionsService.getSelectionIds($scope.type)
        );

        // Using timeout due to digest cycle glitch, this way the selections are cleared.
        $timeout(function () {
          SearchResultSelectionsService.clearSelections($scope.type);
        });

        return ngObibaMicaUrl.getUrl('JoinQuerySearchCsvResource').replace(':type', $scope.type).replace(':query', encodeURI(rql));
      };

      $scope.getReportUrl = function () {
        if ($scope.query === null) {
          return $scope.query;
        }
        var queryWithLimit = rewriteQueryWithLimitAndFields(100000);
        return ngObibaMicaUrl.getUrl('JoinQuerySearchCsvResource').replace(':type', $scope.type).replace(':query', encodeURI(queryWithLimit));
      };

      $scope.onCartUpdate = function (beforeCount, set) {
        const addedCount = set.count - (beforeCount ? beforeCount.count : 0);
        SetsAlertBuilder.newBuilder(AlertService)
          .withCount(addedCount)
          .withMsgKey('sets.cart.variables-added')
          .withEmptyMsgKey('sets.cart.no-variable-added')
          .withRedirectUrl(ngObibaMicaUrl.getUrl('CartPage'))
          .showAlert();
        SearchResultSelectionsService.clearSelections($scope.type);
      };

      $scope.onSetUpdate = function (setId, setName, addedCount) {
        SetsAlertBuilder.newBuilder(AlertService)
          .withId(setId)
          .withName(setName)
          .withCount(addedCount)
          .withMsgKey('sets.set.variables-added')
          .withEmptyMsgKey('sets.set.no-variable-added')
          .withRedirectUrl(ngObibaMicaUrl.getUrl('SetsPage'))
          .showAlert();
        SearchResultSelectionsService.clearSelections($scope.type);
      };

      $scope.addToCart = function (type) {
        const ids = SearchResultSelectionsService.getSelections($scope.type);
        const keys = ids ? Object.keys(ids) : null;
        if ($scope.query === null) {
          return $scope.query;
        }

        const beforeCart = SetService.getCartSet(type);

        if (keys && keys.length > 0) {
          SetService.addDocumentToCart(type, keys).then(function (set) {
            $scope.onCartUpdate(beforeCart, set);
          });
        } else {
          const queryWithLimit = rewriteQueryWithLimitAndFields(SetService.getMaxItemsPerSets(), ['id']);
          SetService.addDocumentQueryToCart('variables', queryWithLimit).then(function (set) {
            $scope.onCartUpdate(beforeCart, set);
          });
        }
      };

      $scope.addToSet = function (type) {
        var sels = SearchResultSelectionsService.getSelections($scope.type);
        $uibModal.open({
          keyboard: false,
          component: 'addToSetModal',
          resolve: {
            query: function () {
              return $scope.query;
            }, type: function () {
              return type;
            }, ids: function () {
              return sels;
            }
          }
        }).result.then(function (result) {
          $scope.onSetUpdate(result.id, result.name, result.newCount);
        });
      };

      $scope.getSelections = function () {
        const ids = SearchResultSelectionsService.getSelections($scope.type);
        return ids ? Object.keys(ids) : null;
      };

      $scope.getStudySpecificReportUrl = function () {

        if ($scope.query === null) {
          return $scope.query;
        }

        var parsedQuery = RqlQueryService.parseQuery($scope.query);
        var target = typeToTarget($scope.type);
        var targetQuery = parsedQuery.args.filter(function (query) {
          return query.name === target;
        }).pop();
        RqlQueryUtils.addLimit(targetQuery, RqlQueryUtils.limit(0, 100000));
        var queryWithoutLimit = new RqlQuery().serializeArgs(parsedQuery.args);

        return ngObibaMicaUrl.getUrl('JoinQuerySearchCsvReportResource').replace(':type', $scope.type).replace(':query', encodeURI(queryWithoutLimit));
      };

      $scope.$watchCollection('result', function () {
        if ($scope.result.list) {
          $scope.activeTarget[QUERY_TYPES.VARIABLES].totalHits = $scope.result.list.variableResultDto.totalHits;
          $scope.activeTarget[QUERY_TYPES.DATASETS].totalHits = $scope.result.list.datasetResultDto.totalHits;
          $scope.activeTarget[QUERY_TYPES.STUDIES].totalHits = $scope.result.list.studyResultDto.totalHits;
          $scope.activeTarget[QUERY_TYPES.NETWORKS].totalHits = $scope.result.list.networkResultDto.totalHits;
        }
      });

      $scope.$watch('type', function (type) {
        updateType(type);
      });

      $scope.DISPLAY_TYPES = DISPLAY_TYPES;

      SetService.serverConfig().then((config) => {
        $scope.userCanCreateCart = config.currentUserCanCreateCart;
        $scope.userCanCreateSets = config.currentUserCanCreateSets;
      });
    }])

  .directive('resultPanel', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        type: '=',
        bucket: '=',
        query: '=',
        criteria: '=',
        display: '=',
        result: '=',
        lang: '=',
        loading: '=',
        pagination: '<',
        searchTabsOrder: '=',
        resultTabsOrder: '=',
        onTypeChanged: '=',
        onBucketChanged: '=',
        onPaginate: '=',
        onUpdateCriteria: '=',
        onRemoveCriteria: '='
      },
      controller: 'SearchResultController',
      templateUrl: 'search/components/result/search-result/component.html'
    };
  }]);