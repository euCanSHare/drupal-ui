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


mica.ObibaGraphicCharts
  .directive('graphicMainCharts', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {},
      templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/graphic-main',
      controller: 'GraphicNetworkMainController'
    };
  }])

  .directive('graphicChartContainer', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        type: '='
      },
      templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/graphic-chart-container',
      controller: 'ChartController'
    };
  }])
  .directive('graphicChartBockContainerCountriesIso', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        type: '@'
      },
      templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/graphic-chart-block-container',
      controller: 'ChartBlockController'
    };
  }]).directive('graphicChartBockContainerMethodsDesigns', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        type: '@'
      },
      templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/graphic-chart-block-container',
      controller: 'ChartBlockController'
    };
  }])
  .directive('graphicChartBockContainerNumberParticipants', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        type: '@'
      },
      templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/graphic-chart-block-container',
      controller: 'ChartBlockController'
    };
  }])
  .directive('graphicChartBockContainerPopulationDceBioSamples', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        type: '@'
      },
      templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/graphic-chart-block-container',
      controller: 'ChartBlockController'
    };
  }]);