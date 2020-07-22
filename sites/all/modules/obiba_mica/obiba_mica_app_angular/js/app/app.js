/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file
 * JavaScript ajax helper for Statistics variables retrieving
 */

'use strict';
angular.module('ObibaTranslation', ['pascalprecht.translate'])
  .config(['$translateProvider' , function($translateProvider){
      $translateProvider
        .fallbackLanguage(Drupal.settings.angularjsApp.locale || 'en')
        .preferredLanguage(Drupal.settings.angularjsApp.locale)
         .useUrlLoader(Drupal.settings.basePath + 'obiba_mica_app_angular/translation/' + Drupal.settings.angularjsApp.locale)
        .useSanitizeValueStrategy('escaped')
        .use(Drupal.settings.angularjsApp.locale);
    }]
  );
var modules = [
  'http-auth-interceptor',
  'ObibaTranslation',
  'ngObiba',
  'ngRoute',
  'ngSanitize',
  'ngResource',
  'ui.bootstrap',
  'obiba.form',
  'obiba.graphics',
  'obiba.comments',
  'angularUtils.directives.dirPagination',
  'pascalprecht.translate',
  'ngObibaMica',
  'sfRadioGroupCollection'
];
var sanitizeModules = function (origArr) {
  if (!Array.isArray(origArr)) {
    var res = [];
    for (var i in origArr) {
      res.push(origArr[i]);
    }
    origArr = res;
  }

  var newArr = [],
    origLen = origArr.length,
    found, x, y;

  for (x = 0; x < origLen; x ++) {
    found = undefined;
    for (y = 0; y < newArr.length; y ++) {
      if (origArr[x] === newArr[y]) {
        found = true;
        break;
      }
    }
    if (! found && origArr[x] !== false) {
      newArr.push(origArr[x]);
    }
  }
  return newArr;
};
var drupalModules = sanitizeModules(Drupal.settings.angularjsApp.modules);

/* App Module */
if (drupalModules) {
  modules = modules.concat(drupalModules);
}
var mica = angular.module('mica', modules);

mica.config(['$routeProvider', '$locationProvider', 'ObibaServerConfigResourceProvider',
  function ($routeProvider, $locationProvider, ObibaServerConfigResourceProvider) {

    $locationProvider.hashPrefix('');

    ObibaServerConfigResourceProvider.setFactory(
      ['$q', function($q) {
        return {
          get: function(callback) {
            return $q.when(callback(Drupal.settings.angularjsApp.micaServerConfig));
          }
        }
      }
      ]);

  }]);

mica.config(['ngObibaMicaSearchProvider', 'ngObibaMicaUrlProvider',
  function (ngObibaMicaSearchProvider, ngObibaMicaUrlProvider) {
    var basePathAndPathPrefix = Drupal.settings.basePath + Drupal.settings.pathPrefix;

    ngObibaMicaUrlProvider.setUrl('DataAccessClientDetailPath', 'mica/data_access/request');
    ngObibaMicaUrlProvider.setUrl('DataAccessClientListPath',  'mica/data_access/requests');
    ngObibaMicaUrlProvider.setUrl('DataAccessFormConfigResource', basePathAndPathPrefix + 'mica/data_access/data-access-form/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessAmendmentFormConfigResource', basePathAndPathPrefix + 'mica/data_access/data-access-amendment-form/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestsExportHistoryResource', Drupal.settings.basePath + 'mica/data_access/requests/_history/ws' + ((Drupal.settings.basePath.indexOf('?q=')!==-1)?'&':'?') + 'lang=:lang');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestsExportCsvResource', Drupal.settings.basePath + 'mica/data_access/requests/csv/ws' + ((Drupal.settings.basePath.indexOf('?q=')!==-1)?'&':'?') + 'lang=:lang');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestsResource', basePathAndPathPrefix + 'mica/data_access/requests/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessAmendmentsResource', Drupal.settings.basePath + 'mica/data_access/request/:parentId/amendments/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestResource', basePathAndPathPrefix + 'mica/data_access/request/:id/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestStartDateResource', basePathAndPathPrefix + 'mica/data_access/request/:id/_start-date/ws?date=:date');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestActionLogsResource', basePathAndPathPrefix + 'mica/data_access/request/:id/_log-actions/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessAmendmentsLogHistoryResource', basePathAndPathPrefix + 'mica/data_access/request/:id/amendments/_history/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessAmendmentResource', basePathAndPathPrefix + 'mica/data_access/request/:parentId/amendment/:id/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestAttachmentsUpdateResource', basePathAndPathPrefix + 'mica/data_access/request/:id/_attachments/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestAttachmentDownloadResource', basePathAndPathPrefix + 'mica/data_access/request/:id/attachments/:attachmentId/_download/ws');
    ngObibaMicaUrlProvider.setUrl('SchemaFormAttachmentDownloadResource', basePathAndPathPrefix + 'mica/data_access/request/form/attachments/:attachmentName/:attachmentId/_download/ws' + ((Drupal.settings.basePath.indexOf('?q=')!==-1)?'&':'?') + 'path=:path');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestDownloadPdfResource', basePathAndPathPrefix + 'mica/data_access/request/:id/_pdf/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestCommentsResource', basePathAndPathPrefix + 'mica/data_access/request/:id/comments/ws?admin=:admin');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestCommentResource', basePathAndPathPrefix + 'mica/data_access/request/:id/comment/:commentId/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessRequestStatusResource', basePathAndPathPrefix + 'mica/data_access/request/:id/_status/:status/ws');
    ngObibaMicaUrlProvider.setUrl('DataAccessAmendmentStatusResource', basePathAndPathPrefix + 'mica/data_access/request/:parentId/amendment/:id/_status/:status/ws');
    ngObibaMicaUrlProvider.setUrl('TempFileUploadResource', basePathAndPathPrefix + 'mica/data_access/request/upload-file');
    ngObibaMicaUrlProvider.setUrl('TempFileResource', basePathAndPathPrefix + 'mica/data_access/request/file/:id');
    ngObibaMicaUrlProvider.setUrl('TaxonomiesSearchResource', basePathAndPathPrefix + 'mica/repository/taxonomies/_search/ws');
    ngObibaMicaUrlProvider.setUrl('TaxonomiesResource', basePathAndPathPrefix + 'mica/repository/taxonomies/_filter/ws');
    ngObibaMicaUrlProvider.setUrl('TaxonomyResource', basePathAndPathPrefix + 'mica/repository/taxonomy/:taxonomy/_filter/ws');
    ngObibaMicaUrlProvider.setUrl('VocabularyResource', basePathAndPathPrefix + 'mica/repository/taxonomy/:taxonomy/vocabulary/:vocabulary/_filter/ws');
    ngObibaMicaUrlProvider.setUrl('VariableResource', basePathAndPathPrefix + 'mica/variable/:id/ws');
    ngObibaMicaUrlProvider.setUrl('VariableSummaryResource', basePathAndPathPrefix + 'mica/variable/:id/summary/ws');
    ngObibaMicaUrlProvider.setUrl('CartPage', basePathAndPathPrefix + 'mica/cart#/cart');
    ngObibaMicaUrlProvider.setUrl('SetsPage', basePathAndPathPrefix + 'mica/sets#/sets');
    ngObibaMicaUrlProvider.setUrl('SetsResource', basePathAndPathPrefix + 'mica/sets/:type/sets/ws');
    ngObibaMicaUrlProvider.setUrl('SetsImportResource', basePathAndPathPrefix + 'mica/sets/:type/sets/_import/ws');
    ngObibaMicaUrlProvider.setUrl('SetResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/ws');
    ngObibaMicaUrlProvider.setUrl('SetOpalExportResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/documents/_opal/ws');
    ngObibaMicaUrlProvider.setUrl('SetDocumentsResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/documents/:from/:limit/ws');
    ngObibaMicaUrlProvider.setUrl('SetClearResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/documents/ws');
    ngObibaMicaUrlProvider.setUrl('SetExistsResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/document/:did/_exists/ws');
    ngObibaMicaUrlProvider.setUrl('SetImportResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/documents/_import/ws');
    ngObibaMicaUrlProvider.setUrl('SetImportQueryResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/documents/_rql/ws');
    ngObibaMicaUrlProvider.setUrl('SetRemoveResource', basePathAndPathPrefix + 'mica/sets/:type/set/:id/documents/_delete/ws');
    ngObibaMicaUrlProvider.setUrl('JoinQuerySearchResource', basePathAndPathPrefix + 'mica/repository/:type/_rql/ws');
    ngObibaMicaUrlProvider.setUrl('JoinQuerySearchCsvResource', basePathAndPathPrefix + 'mica/repository/:type/_rql_csv/ws?query=:query');
    ngObibaMicaUrlProvider.setUrl('JoinQuerySearchCsvReportResource', basePathAndPathPrefix + 'mica/repository/:type/_report/ws?query=:query');
    ngObibaMicaUrlProvider.setUrl('JoinQuerySearchCsvReportByNetworkResource', basePathAndPathPrefix +  'mica/repository/:type/_report_by_network/:networkId/:locale/ws');
    ngObibaMicaUrlProvider.setUrl('JoinQueryCoverageResource', basePathAndPathPrefix + 'mica/repository/variables/_coverage/ws');
    ngObibaMicaUrlProvider.setUrl('JoinQueryCoverageDownloadResource',  basePathAndPathPrefix + 'mica/repository/variables/_coverage_download/ws?query=:query');
    ngObibaMicaUrlProvider.setUrl('VariablePage', basePathAndPathPrefix + 'mica/variable/:variable');
    ngObibaMicaUrlProvider.setUrl('NetworkPage', basePathAndPathPrefix + 'mica/network/:network');
    ngObibaMicaUrlProvider.setUrl('StudyPage', basePathAndPathPrefix + 'mica/:type/:study');
    ngObibaMicaUrlProvider.setUrl('StudyPopulationsPage', basePathAndPathPrefix + 'mica/:type/:study/#population-:population');
    ngObibaMicaUrlProvider.setUrl('StudyDcePage', basePathAndPathPrefix + 'mica/:type/:study/#dce-id-:dce');
    ngObibaMicaUrlProvider.setUrl('DatasetPage', basePathAndPathPrefix + 'mica/:type/:dataset');
    ngObibaMicaUrlProvider.setUrl('BaseUrl', basePathAndPathPrefix);
    ngObibaMicaUrlProvider.setUrl('FileBrowserFileResource', basePathAndPathPrefix + 'mica/file');
    ngObibaMicaUrlProvider.setUrl('FileBrowserSearchResource', basePathAndPathPrefix + 'mica/files/search');
    ngObibaMicaUrlProvider.setUrl('FileBrowserDownloadUrl', basePathAndPathPrefix + 'mica/file/download' + ((Drupal.settings.basePath.indexOf('?q=')!==-1)?'&':'?') + 'path=:path&inline=:inline&keyToken=:key');
    ngObibaMicaUrlProvider.setUrl('SearchBaseUrl', 'mica/repository#/search');
    ngObibaMicaUrlProvider.setUrl('SearchPage', basePathAndPathPrefix + 'mica/repository#/search?query=:query');
    ngObibaMicaUrlProvider.setUrl('DocumentSuggestion', basePathAndPathPrefix + 'mica/repository/:documentType/_suggest/ws');
    ngObibaMicaUrlProvider.setUrl('EntitiesCountResource', basePathAndPathPrefix + 'mica/analysis/entities_count/ws');
    ngObibaMicaUrlProvider.setUrl('EntitiesCountBaseUrl', 'mica/analysis#/entities-count');
    ngObibaMicaUrlProvider.setUrl('DatasetCategoricalVariablesResource', basePathAndPathPrefix + 'mica/:dsType/:dsId/variables/:query/categorical/ws');
    ngObibaMicaUrlProvider.setUrl('DatasetVariablesResource', basePathAndPathPrefix + 'mica/:dsType/:dsId/variables/:query/ws');
    ngObibaMicaUrlProvider.setUrl('DatasetVariableResource', basePathAndPathPrefix + 'mica/variable/:varId/ws');
    ngObibaMicaUrlProvider.setUrl('DatasetVariablesCrosstabResource', basePathAndPathPrefix + 'mica/:dsType/:dsId/variables/cross/:v1/by/:v2/ws');
    ngObibaMicaUrlProvider.setUrl('DatasetResource', basePathAndPathPrefix + 'mica/dataset/:dsType/:dsId/ws');
  }]);

mica.provider('SessionProxy',
  function () {
    function Proxy(user) {
      var roles = Object.keys(user.roles).map(function (key) {
        return user.roles[key];
      });
      var real = {login: user.name, roles: roles, profile: user.data || null};

      this.login = function () {
        return real.login;
      };

      this.roles = function () {
        return real.roles;
      };

      this.profile = function () {
        return real.profile;
      };
    }

    this.$get = function () {
      return new Proxy(Drupal.settings.angularjsApp.user);
    };
  });

mica.run(['amMoment', function(amMoment){
  amMoment.changeLocale(Drupal.settings.angularjsApp.locale);
}]);

mica.controller('MainController', [
  function () {
  }]);

mica.factory('TranslationService', ['$resource',
  function ($resource) {
    return $resource(Drupal.settings.basePath + 'obiba_mica_app_angular/translation', {}, {
      'get': {method: 'GET'}
    });
  }]);

mica.factory('urlEncode', [
  function () {
     return function (input) {
       function encodeSpecialChar(string){
         if(string.match(/%2F|%24|%26|%5C/gm)){
           string = string.replace('%2F', '%252F'); //'/'
           string = string.replace('%24', '%2524'); //'$'
           string = string.replace('%26', '%2526'); //'&'
           string = string.replace('%5C', '%255C'); //'\'
         }
         return string;
       }
       return encodeSpecialChar(window.encodeURIComponent(input));
     };
  }]);

mica.factory('ErrorTemplate', function () {
  return {
    getServerError: function (response) {
      if (angular.isObject(response.data)) {
        if (! response.data.messageTemplate) {
          response.data.messageTemplate = 'server.error.' + response.status;
        }
      } else {
        response.data = {messageTemplate: 'server.error.' + response.status};
      }
      return response;
    }
  }

});

mica.factory('ForbiddenDrupalRedirect', function () {

  var createDestinationPath = function (path) {
    if (angular.isDefined(path)) {
      var regExp = new RegExp('(view|edit)\/(.*)$');
      var results = regExp.exec(path);
      if (results && results.length > 1) {
        return '?destination=mica/data_access/request/redirect/' + results[1] + '/' + results[2];
      }

      return '';
    }
  };

  return {
    redirectDrupalMessage: function (response) {
      if (response.status && response.status == 403 && ! Drupal.settings.angularjsApp.authenticated) {
        $.post('un-authorized-error');
        $(window).delay(200).queue(function () {
          window.location = Drupal.settings.basePath + 'user/login' + createDestinationPath(window.location.hash);
        });
      }
    }
  }

});

/**
 * A N G U L A R     G L O B A L     S E R V I C E S
 */

mica.service('ServerErrorAlertService', ['AlertService', 'ServerErrorUtils', 'ErrorTemplate',
  function (AlertService, ServerErrorUtils, ErrorTemplate) {
    this.alert = function (id, response) {
      if (angular.isDefined(response.data)) {
        var errorDto = JSON.parse(response.data);
        if (angular.isDefined(errorDto) && angular.isDefined(errorDto.messageTemplate)) {
          AlertService.alert({
            id: id,
            type: 'danger',
            msgKey: errorDto.messageTemplate,
            msgArgs: errorDto.arguments
          });
          return;
        }
      }

      AlertService.alert({
        id: id,
        type: 'danger',
        msg: ServerErrorUtils.buildMessage(ErrorTemplate.getServerError(response))
      });
    };

    return this;
  }]);

mica.service('AttributeService',
  function () {
    return {
      getAttributes: function (container, names) {
        if (! container && ! container.attributes && ! names) {
          return null;
        }
        return container.attributes.filter(
          function (attribute) {
            return names.indexOf(attribute.name) !== - 1;
          });
      },

      getValue: function (attribute) {
        if (! attribute) {
          return null;
        }
        var value = attribute.values.filter(
          function (value) {
            return value.lang === Drupal.settings.angularjsApp.locale || value.lang === 'und';
          });

        return value.length > 0 ? value[0].value : null;
      }
    }
  })
  .service('GraphicChartsConfigurations', ['GraphicChartsConfig', function (GraphicChartsConfig) {
    this.setClientConfig = function () {
      GraphicChartsConfig.setOptions(Drupal.settings.GraphicChartsOptions);
    };
  }])

  // as per https://stackoverflow.com/a/17426614
  // useful to 'compile' angular expressions in binded html
  .directive('compile', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$watch(
          function(scope) {
              // watch the 'compile' expression for changes
              return scope.$eval(attrs.compile);
          },
          function(value) {
              // when the 'compile' expression changes
              // assign it into the current DOM
              element.html(value);

              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);
          }
        );
      }
    };
  }])

  .directive('redirectionPlaceHolder', function() {
    return {
      restrict: 'C',
      link: function (scope, element, attrs) {
        var pathName = Drupal.settings.currentPath;
        var currentLocation = location.href;
        var urlDestination = currentLocation.split('?destination=')[1];

        if (!urlDestination) {
          urlDestination = pathName + '#' + currentLocation.split('#')[1];
        }

        var href = element.attr('href');

        var positionDestination = href.indexOf('?destination=');
        var basePath = href.substring(0, positionDestination !== -1 ? positionDestination : href.length);

        if (!basePath.startsWith('/')) { // check if href is relative and fix it
          basePath = Drupal.settings.basePath + basePath;
        }

        element.attr('href', basePath + '?destination=' + urlDestination);
      }
    };
  })

  .directive('anonOnly', function() {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
        var isMicaUser = Drupal.settings.angularjsApp.authenticated && Drupal.settings.angularjsApp.agate_user;
        if (isMicaUser) {
          element.hide();
        } else {
          element.show();
        }
      }
    };
  })
  .directive('loggedIn', function() {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
        var isMicaUser = Drupal.settings.angularjsApp.authenticated && Drupal.settings.angularjsApp.agate_user;
        scope.basePath = Drupal.settings.basePath;
        if (!isMicaUser) {
          element.hide();
        } else {
          element.show();
        }
      }
    };
  });
