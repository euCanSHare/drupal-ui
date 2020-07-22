/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

mica.DataAccessRequest = angular.module('mica.DataAccessRequest', [
  'obiba.mica.access',
  'sfObibaFileUpload',
  'sfCheckboxgroup',
  'schemaForm-datepicker'
])
  .config(['ngObibaMicaAccessTemplateUrlProvider',
    function (ngObibaMicaAccessTemplateUrlProvider) {
      ngObibaMicaAccessTemplateUrlProvider.setHeaderUrl('view',Drupal.settings.basePath + Drupal.settings.pathPrefix + 'obiba_mica_app_angular_view_template/obiba_mica_data_access_request-view-header');
      ngObibaMicaAccessTemplateUrlProvider.setHeaderUrl('form', Drupal.settings.basePath + Drupal.settings.pathPrefix + 'obiba_mica_app_angular_view_template/obiba_mica_data_access_request-form-header');
      ngObibaMicaAccessTemplateUrlProvider.setHeaderUrl('amendmentView', Drupal.settings.basePath + Drupal.settings.pathPrefix + 'obiba_mica_app_angular_view_template/obiba_mica_data_access_amendment-view-header');
      ngObibaMicaAccessTemplateUrlProvider.setHeaderUrl('amendmentForm', Drupal.settings.basePath + Drupal.settings.pathPrefix + 'obiba_mica_app_angular_view_template/obiba_mica_data_access_amendment-form-header');
    }])
  .run(['DataAccessRequestConfig', 'DataAccessRequestDirtyStateService', function(DataAccessRequestConfig, DataAccessRequestDirtyStateService){
    window.addEventListener('beforeunload', function (event) {
      if (DataAccessRequestDirtyStateService.isDirty()) {
        // will still use the default browser text, the message here is irrelevant
        event.returnValue = 'Leaving so soon?'; // Gecko, Trident, Chrome 34+
        return 'Leaving so soon?'; // Gecko, WebKit, Chrome <34
      }
    });
    DataAccessRequestConfig .setOptions(Drupal.settings.angularjsApp.data_access_config);
  }]);
