/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

mica.ObibaSets = angular.module('mica.ObibaSets', [
    'obiba.mica.sets'
  ])
  .config(['ngObibaMicaSetsTemplateUrlProvider', 'ngObibaMicaSearchProvider',
    function (ngObibaMicaSetsTemplateUrlProvider, ngObibaMicaSearchProvider) {
      ngObibaMicaSearchProvider.initialize(Drupal.settings.angularjsApp.obibaSearchOptions);
      ngObibaMicaSetsTemplateUrlProvider.setHeaderUrl('cart', Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_sets_cart-view-header');
      ngObibaMicaSetsTemplateUrlProvider.setHeaderUrl('sets', Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_sets_sets-view-header');
    }])
    .run(['SetService', function(SetService) {
      SetService.setSettingOption(Drupal.settings.angularjsApp.sets_config);
    }]);
