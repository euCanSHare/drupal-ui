/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


mica.ObibaLists = angular.module('mica.ObibaLists', [
  'obiba.mica.lists'
])
  .run()
  .config(['ngObibaMicaSearchProvider', 'markedProvider', 'sortWidgetOptionsProvider', 'ngObibaMicaSearchTemplateUrlProvider',
    function (ngObibaMicaSearchProvider, markedProvider, sortWidgetOptionsProvider, ngObibaMicaSearchTemplateUrlProvider) {
    if(Drupal.settings.obibaListOptions){
      sortWidgetOptionsProvider.setOptions(Drupal.settings.obibaListOptions);
    }

    markedProvider.setOptions({
      gfm: true,
      tables: true,
      sanitize: false
    });
    if(Drupal.settings.obibaListOptions.studyOptions){
      Drupal.settings.obibaListSearchOptions.studies.obibaListOptions = Drupal.settings.obibaListOptions.studyOptions;
    }
    if(Drupal.settings.obibaListOptions.networkOptions){
      Drupal.settings.obibaListSearchOptions.networks.obibaListOptions = Drupal.settings.obibaListOptions.networkOptions;
    }
    if(Drupal.settings.obibaListOptions.datasetOptions){
      Drupal.settings.obibaListSearchOptions.datasets.obibaListOptions = Drupal.settings.obibaListOptions.datasetOptions;
    }
    Drupal.settings.obibaListSearchOptions.listLayout = 'layout1';
    ngObibaMicaSearchProvider.initialize(Drupal.settings.obibaListSearchOptions);
    if(Drupal.settings.listOverrideThemes){
      angular.forEach(Drupal.settings.listOverrideThemes, function (template, keyTemplate) {
        ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl(keyTemplate, Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/' + template);
      })
    }
  }])
  .filter('getBaseUrl', function () {
    return function (param) {
      return Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/' + param;
    }
  }).filter('doSearchQuery', function () {
    return function (type, query) {
      return Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/repository#/search?type=' + type + '&query=' + query + '&display=list'
    }
  })
  .filter('getLabel', function () {
    return function (SelectSort, valueSort) {
      var result = null;
      angular.forEach(SelectSort.options, function (value, key) {
        if (value.value.indexOf(valueSort) !== -1) {
          result = value.label;
        }
      });
      return result;
    }
  });
