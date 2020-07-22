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

mica.ObibaGraphicCharts = angular.module('mica.ObibaGraphicCharts', [
    'obiba.mica.graphics'
  ])
  .constant('ChartType', {
    GEO_CHARTS: 0,
    STUDY_DESIGN: 1,
    NUMBER_PARTICIPANTS: 2,
    BIO_SAMPLES: 3,
    START_YEAR: 4
  }).config(['ngObibaMicaGraphicTemplateUrlProvider', function (ngObibaMicaGraphicTemplateUrlProvider) {
    if(Drupal.settings.GraphicChartsOptions && Drupal.settings.GraphicChartsOptions.overrideTheme){
      angular.forEach(Drupal.settings.GraphicChartsOptions.overrideTheme, function (template, keyTemplate) {
        ngObibaMicaGraphicTemplateUrlProvider.setTemplateUrl(keyTemplate, Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/' + template);
      })
    }
  }])
  .controller('GraphicNetworkMainController', ['$scope', 'ChartType', 'TaxonomyResource',
    function ($scope, ChartType, TaxonomyResource) {
      var studyTaxonomy = {};
      if(!studyTaxonomy.vocabularies){
        TaxonomyResource.get({
          target: 'study',
          taxonomy: 'Mica_study'
        }).$promise.then(function(taxonomy){
          studyTaxonomy.vocabularies = angular.copy(taxonomy.vocabularies);
        });
      }
      $scope.getVocabulary =  function(vocabularyName){
        if(studyTaxonomy.vocabularies){
          return studyTaxonomy.vocabularies.find(function(vocabulary){
            return vocabulary.name === vocabularyName;
          });
        }
      };
      $scope.activeTab = ChartType.GEO_CHARTS;
    }])
    .factory('CoverageResource', ['$resource', function ($resource) {
      function resourceErrorHandler(response) {
        return {
          code: response.status,
          message: response.statusText
        };
      }
      return $resource(Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/ng/coverage/:type/:id', {}, {'get': {method: 'GET', interceptor : {responseError : resourceErrorHandler}}});
    }]);
