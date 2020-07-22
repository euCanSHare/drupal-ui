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

function GraphicChartsDataProvider() {

  function DataProvider(dataResponse) {
    var data = dataResponse;
    this.getData = function (callback) {
      if (callback) {
        data.$promise.then(callback);
      }
    };
  }

  this.$get = ['$log', 'JoinQuerySearchResource', 'ServerErrorUtils', 'AlertService', 'GraphicChartsConfig', 'GraphicChartsQuery',
    function ($log, JoinQuerySearchResource, ServerErrorUtils, AlertService, GraphicChartsConfig, GraphicChartsQuery) {
    var chartConf = GraphicChartsConfig.getOptions();
    var queryDto = GraphicChartsQuery.queryDtoBuilder(chartConf.entityIds, chartConf.entityType);

    return new DataProvider(JoinQuerySearchResource.studies({
        query: queryDto
      },
      function onSuccess (response) {
          return response;
      },
      function (response) {
        $log.error('Server error', response);
      }));
  }];
}

ngObibaMica.graphics = angular.module('obiba.mica.graphics', [
    'obiba.graphics',
    'obiba.utils',
    'templates-ngObibaMica'
  ]);

/* global NgObibaMicaTemplateUrlFactory */

ngObibaMica.graphics
  .config(['$provide', function ($provide) {
    $provide.provider('GraphicChartsData', GraphicChartsDataProvider);
  }])
  .config(['$provide', function ($provide) {
    $provide.provider('ngObibaMicaGraphicTemplateUrl', new NgObibaMicaTemplateUrlFactory().create(
      {
        graphicTableDirectiveTemplate: { template: null },
      }
    ));
  }])
  .run(['GraphicChartsConfigurations',
  function (GraphicChartsConfigurations) {
    GraphicChartsConfigurations.setClientConfig();
  }]);
