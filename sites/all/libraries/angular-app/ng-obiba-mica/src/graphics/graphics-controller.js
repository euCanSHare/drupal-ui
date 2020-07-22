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

ngObibaMica.graphics

  .controller('GraphicChartsController', [
    '$rootScope',
    '$scope',
    '$filter',
    '$window',
    'GraphicChartsConfig',
    'GraphicChartsUtils',
    'GraphicChartsData',
    'RqlQueryService',
    'ngObibaMicaUrl',
    'LocalizedValues',
    'RqlQueryUpdaterFactory',
    function ($rootScope,
              $scope,
              $filter,
              $window,
              GraphicChartsConfig,
              GraphicChartsUtils,
              GraphicChartsData,
              RqlQueryService,
              ngObibaMicaUrl,
              LocalizedValues,
              RqlQueryUpdaterFactory) {
      var graphOptions =  GraphicChartsConfig.getOptions();

      function updateTableData(graphOptions){
        $scope.chartObject.ordered = graphOptions.ChartsOptions[$scope.chartConfig.chartType].ordered;
        $scope.chartObject.notOrdered = graphOptions.ChartsOptions[$scope.chartConfig.chartType].notOrdered;
        $scope.chartObject.sortedby = graphOptions.ChartsOptions[$scope.chartConfig.chartType].sortedby;
        $scope.chartObject.getTable= function(){
          return $scope.chartObject.data;
        };
        if($scope.chartObject.sortedby.length > 0){
          $scope.sort = {
            sortingOrder : $scope.chartObject.sortedby[0],
            reverse : false
          };
          if ($scope.sort.sortingOrder !== '' && $scope.chartObject.ordered) {
            $scope.chartObject.entries = Object.keys($scope.chartObject.entries).map(function(key){
              return $scope.chartObject.entries[key];
            });
            $scope.chartObject.entries = $filter('orderBy')($scope.chartObject.entries, $scope.sort.sortingOrder, $scope.sort.reverse);
          }
        }
        else{
          $scope.sort = {
            sortingOrder : false,
            reverse : false
          };
        }
        $scope.localizedNumber = function (number, fixLength){
          return LocalizedValues.formatNumber(number, fixLength);
        };
        $scope.graphicTable = {
          headerAlignment: graphOptions.ChartsOptions[$scope.chartConfig.chartType].headerAlignment,
          valuesAlignment: graphOptions.ChartsOptions[$scope.chartConfig.chartType].valuesAlignment,
          useMonoFont: graphOptions.ChartsOptions[$scope.chartConfig.chartType].useMonoFont
        };
      }

      $scope.changeSorting = function (column) {
        if($scope.chartObject.sortedby.length > 0) {
          var sort = $scope.sort;
          if (sort.sortingOrder === column) {
            sort.reverse = !$scope.sort.reverse;
          } else {
            sort.sortingOrder = column;
            sort.reverse = false;
          }
          $scope.sort = sort;
          $scope.$broadcast('ngObibaTableSortUpdate');
        }
      };
      $scope.columnOrderClass = function (column) {
        if($scope.chartObject.sortedby.length > 0) {
          if (column === $scope.sort.sortingOrder) {
            return ('fa fa-chevron-' + (($scope.sort.reverse) ? 'down' : 'up'));
          } else {
            return 'fa fa-sort';
          }
        }
      };

      $scope.updateCriteria = function(key, vocabulary) {
        RqlQueryService.createCriteriaItem('study', 'Mica_study', vocabulary, key).then(function (item) {
          var entity = graphOptions.entityType;
          var id = graphOptions.entityIds;
          var parts = item.id.split('.');
          var queryParams = RqlQueryUpdaterFactory.create(null, QUERY_TYPES.STUDIES, 'list');
            switch (key) {
              case 'missing':
                var missingQuery = new RqlQuery(RQL_NODE.MISSING);
                missingQuery.args = [parts[0] + '.' + parts[1]];
                queryParams.update(QUERY_TARGETS.STUDY, missingQuery, true, true);
                break;
              case'exists':
                if(parts[1] && parts[1] === 'start-range'){
                  var existsQuery = new RqlQuery(RQL_NODE.EXISTS);
                  existsQuery.args = [parts[0] + '.' + parts[1]];
                  queryParams.update(QUERY_TARGETS.STUDY, existsQuery, true, true);
                }
                break;
              default:
                var mainQuery = new RqlQuery(RQL_NODE.IN);
                mainQuery.args = [parts[0] + '.' + parts[1], (entity && id) ? encodeURIComponent(parts[2]) : parts[2]];
                queryParams.update(QUERY_TARGETS.STUDY, mainQuery, true, true);
            }
            var classNameQuery = new RqlQuery(RQL_NODE.IN);
            classNameQuery.args = ['Mica_study.className', 'Study'];
            queryParams.update(QUERY_TARGETS.STUDY, classNameQuery, true, true);
          if(entity && id){
            var networkQuery = new RqlQuery(RQL_NODE.IN);
            networkQuery.args = ['Mica_' + entity + '.id', id];
            queryParams.update(QUERY_TARGETS.NETWORK, networkQuery, true, true);
            $window.location.href = ngObibaMicaUrl.getUrl('BaseUrl') + ngObibaMicaUrl.getUrl('SearchBaseUrl') + '?' + queryParams.asQueryParams();
          }
          else{
            queryParams.execute();
          }
        });
      };

      $scope.ready = true;
      $scope.chartObject = [];
      if($scope.chartStudiesData){
        GraphicChartsUtils.initializeChartData($scope.chartStudiesData.studyResultDto, graphOptions.ChartsOptions, $scope.chartAggregationName, $scope.chartConfig, $scope.chartType).then(function(returnedScope){
          angular.extend($scope.chartObject, returnedScope.chartObject);
          if (/^Table-/.exec($scope.chartType) !== null) {
            updateTableData(graphOptions);
          }
        });
      }
      else{
        $scope.__defineSetter__('chartAggregationName', function(value) {
          if (value) {
            $scope._chartAggregationName = value;
            GraphicChartsData.getData(function (resultDto) {
              if (resultDto) {
                GraphicChartsUtils.initializeChartData(resultDto.studyResultDto, graphOptions.ChartsOptions, $scope.chartAggregationName, $scope.chartConfig, $scope.chartType ).then(function(returnScope){
                  angular.extend($scope.chartObject, returnScope.chartObject);
                  if (/^Table-/.exec($scope.chartType) !== null) {
                    updateTableData(graphOptions);
                  }
                });
              }
            });
          }
        });
        $scope.__defineGetter__('chartAggregationName', function() {
          return $scope._chartAggregationName;
        });
      }

    }]);
