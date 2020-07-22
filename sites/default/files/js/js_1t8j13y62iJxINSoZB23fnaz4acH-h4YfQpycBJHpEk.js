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
;
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
(function ($) {
  Drupal.behaviors.obiba_angular_app_attachement = {
    attach: function (context, settings) {
      mica.attachment = angular.module('mica.attachment', [
        'mica.file',
        'ui.bootstrap',
        'ngFileUpload'
      ]);

    }
  }
}(jQuery));
;
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
 * @license HTTP Auth Interceptor Module for AngularJS
 * (c) 2012 Witold Szczerba
 * License: MIT
 */
(function () {
  'use strict';

  angular.module('http-auth-interceptor', ['http-auth-interceptor-buffer'])
    .factory('MicaHttpInterceptor', ['$rootScope', '$q', '$injector', 'httpBuffer', '$timeout','AlertService','ServerErrorUtils',
      function($rootScope, $q, $injector, httpBuffer, $timeout, AlertService, ServerErrorUtils) {
        function onError(response) {
          AlertService.alert({
            id: 'MainController',
            type: 'danger',
            msg: ServerErrorUtils.buildMessage(response),
            delay: 3000
          });
        }
        return {
          // optional method
          'request': function(config) {
            // do something on success
            return config;
          },

          // optional method
          'requestError': function(rejection) {
            // do something on error
            return $q.reject(rejection);
          },

          // optional method
          'response': function(response) {
            // do something on success
            return response;
          },

          // optional method
          'responseError': function(response) {
            onError(response);
            // otherwise, default behaviour
            return $q.reject(response);
          }
        };
      }])

  /**
   * $http interceptor.
   * On 401 response (without 'ignoreAuthModule' option) stores the request
   * and broadcasts 'event:angular-auth-loginRequired'.
   */
    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push('MicaHttpInterceptor');
    }]);

  /**
   * Private module, a utility, required internally by 'http-auth-interceptor'.
   */
  angular.module('http-auth-interceptor-buffer', [])

    .factory('httpBuffer', ['$injector', function ($injector) {
      /** Holds all the requests, so they can be re-requested in future. */
      var buffer = [];

      /** Service initialized later because of circular dependency problem. */
      var $http;

      function retryHttpRequest(config, deferred) {
        function successCallback(response) {
          deferred.resolve(response);
        }

        function errorCallback(response) {
          deferred.reject(response);
        }

        $http = $http || $injector.get('$http');
        $http(config).then(successCallback, errorCallback);
      }

      return {
        /**
         * Appends HTTP request configuration object with deferred response attached to buffer.
         */
        append: function (config, deferred) {
          buffer.push({
            config: config,
            deferred: deferred
          });
        },

        /**
         * Abandon or reject (if reason provided) all the buffered requests.
         */
        rejectAll: function (reason) {
          if (reason) {
            for (var i = 0; i < buffer.length; ++i) {
              buffer[i].deferred.reject(reason);
            }
          }
          buffer = [];
        },

        /**
         * Retries all the buffered requests clears the buffer.
         */
        retryAll: function (updater) {
          for (var i = 0; i < buffer.length; ++i) {
            retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
          }
          buffer = [];
        }
      };
    }]);
})();
;
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
(function ($) {
  Drupal.behaviors.obiba_angular_app_attachement_directives = {
    attach: function (context, settings) {

      mica.attachment

        .directive('attachmentList', [function () {

          return {
            restrict: 'E',
            scope: {
              hrefBuilder: '&',
              files: '='
            },
            templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_app_angular_attachment-list-template',
            link: function (scope) {
              scope.attachments = [];
              scope.hrefBuilder = scope.hrefBuilder || function (a) { return a.id; };

              scope.$watch('files', function (val) {
                if (val) {
                  scope.attachments = val.map(function (a) {
                    var temp = angular.copy(a);
                    temp.href = scope.hrefBuilder({id: a.id});
                    return temp;

                  });
                }
              }, true);
            }
          };
        }])
        .directive('attachmentInput', [function () {
          return {
            restrict: 'E',
            require: '^form',
            scope: {
              multiple: '=',
              accept: '@',
              files: '='
            },
            templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_app_angular_attachment-input-template',
            controller: 'AttachmentCtrl'
          };
        }])
        .controller('AttachmentCtrl', ['$scope', '$timeout', '$log', 'Upload', 'TempFileResource',
          function ($scope, $timeout, $log, Upload, TempFileResource) {
            $scope.onFileSelect = function (file) {
              $scope.uploadedFiles = file;
              $scope.uploadedFiles.forEach(function (f) {
                uploadFile(f);
              });
            };

            var uploadFile = function (file) {
              var attachment = {
                showProgressBar: true,
                lang: 'en',
                progress: 0,
                fileName: file.name,
                size: file.size
              };

              if ($scope.multiple) {
                $scope.files.push(attachment);
              } else {
                $scope.files.splice(0, $scope.files.length);
                $scope.files.push(attachment);
              }
              $scope.upload = Upload
                .upload({
                  url: 'request/upload-file',
                  method: 'POST',
                  file: file
                })
                .progress(function (evt) {
                  attachment.progress = parseInt(100.0 * evt.loaded / evt.total);
                })
                .success(function (data, status, getResponseHeaders) {
//            var parts = getResponseHeaders().location.split('/')?getResponseHeaders().location.split('/'):data.message;
//            var fileId = parts[parts.length - 1];
                  var fileId = data.message;
                  TempFileResource.get(
                    {id: fileId},
                    function (tempFile) {
                      attachment.id = tempFile.id;
                      attachment.md5 = tempFile.md5;
                      attachment.justUploaded = true;
                      // wait for 1 second before hiding progress bar
                      $timeout(function () { attachment.showProgressBar = false; }, 1000);
                    }
                  );
                });
            };

            $scope.deleteTempFile = function (tempFileId) {
              TempFileResource.delete(
                {id: tempFileId},
                function () {
                  for (var i = $scope.files.length; i--;) {
                    var attachment = $scope.files[i];
                    if (attachment.justUploaded && attachment.id === tempFileId) {
                      $scope.files.splice(i, 1);
                    }
                  }
                }
              );
            };

            $scope.deleteFile = function (fileId) {
              for (var i = $scope.files.length; i--;) {
                if ($scope.files[i].id === fileId) {
                  $scope.files.splice(i, 1);
                }
              }
            };
          }
        ]);

    }
  }
}(jQuery));
;
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
(function ($) {
  Drupal.behaviors.obiba_angular_app_file = {
    attach: function (context, settings) {

      mica.file = angular.module('mica.file', [
        'ngResource'
      ]);

    }
  }
}(jQuery));
;
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
(function ($) {
  Drupal.behaviors.obiba_angular_app_file_filter = {
    attach: function (context, settings) {

      mica.file
        .filter('bytes', function () {
          return function (bytes) {
            return bytes === null || typeof bytes === 'undefined' ? '' : filesize(bytes);
          };
        });

    }
  }
}(jQuery));
;
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
(function ($) {
  Drupal.behaviors.obiba_angular_app_file_service = {
    attach: function (context, settings) {

      mica.file
        .factory('TempFileResource', ['$resource',
          function ($resource) {
            return $resource('request/file/:idRequest/:id', {}, {
              'get': {method: 'GET'},
              'delete': {method: 'DELETE'}
            });
          }]);

    }
  }
}(jQuery));
;
/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

mica.fileBrowser = angular.module('mica.fileBrowser', [
    'obiba.mica.fileBrowser'
  ]).config(['ngObibaMicaFileBrowserOptionsProvider',
  function(ngObibaMicaFileBrowserOptionsProvider){
    ngObibaMicaFileBrowserOptionsProvider.addExcludeFolder('data-collection-event');
    ngObibaMicaFileBrowserOptionsProvider.setOptions({documentsTitle: Drupal.settings.documentsTitle});
  }]);;
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
;
/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

mica.ObibaSearch = angular.module('mica.ObibaSearch', [
    'obiba.mica.search'
  ])
  .run([
    'GraphicChartsConfig',
    function (GraphicChartsConfig) {
      GraphicChartsConfig.setOptions(Drupal.settings.GraphicChartsOptions);
  }])
  .config(['ngObibaMicaSearchTemplateUrlProvider','ngObibaMicaSearchProvider',
    function (ngObibaMicaSearchTemplateUrlProvider, ngObibaMicaSearchProvider) {
      ngObibaMicaSearchProvider.initialize(Drupal.settings.angularjsApp.obibaSearchOptions);
      ngObibaMicaSearchTemplateUrlProvider.setHeaderUrl('search', Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_repository_search-view-header');
      ngObibaMicaSearchTemplateUrlProvider.setHeaderUrl('classifications', Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_repository_classifications-view-header');
      if(Drupal.settings.searchOverrideThemes){
        angular.forEach(Drupal.settings.searchOverrideThemes, function (template, keyTemplate) {
          ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl(keyTemplate, Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/' + template);
        });
      }
    }]);
;
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
    .controller('ChartController', ['$rootScope','$scope', 'GraphicChartsUtils', 'ChartType',
      function ($rootScope, $scope, GraphicChartsUtils, ChartType) {
        /**
         * Helper to test whether to show the chart title or not
         *
         * @returns {boolean}
         */
        var canShowTitle = function() {
          return $scope.type >= 0 && [ChartType.NUMBER_PARTICIPANTS, ChartType.BIO_SAMPLES, ChartType.STUDY_DESIGN, ChartType.START_YEAR].indexOf($scope.type) === -1;
        };

        $scope.chart = {};
        /**
         * Depending on the type of the chart, returns the corresponding options
         *
         * @param type
         */
        var graphs = GraphicChartsUtils.getGraphConfig();

        function getChartOptions(type) {
          switch (type) {
            case ChartType.GEO_CHARTS:
              $scope.chart = graphs['populations-model-selectionCriteria-countriesIso'];
              break;
            case ChartType.STUDY_DESIGN:
              $scope.chart =  graphs['model-methods-design'];
              break;
            case ChartType.NUMBER_PARTICIPANTS:
              $scope.chart =graphs['model-numberOfParticipants-participant-number-range'];
              break;
            case ChartType.BIO_SAMPLES:
              $scope.chart = graphs['populations-dataCollectionEvents-model-bioSamples'];
              break;
            case ChartType.START_YEAR:
              $scope.chart = graphs['model-startYear-range'];
              break;

            default:
              throw new Error('Invalid type: ' + type);
          }

        }

        $scope.canShowTitle = canShowTitle;
        $scope.$watch('type', function(type) {
          getChartOptions(type);
        });

    }])
    .controller('ChartBlockController', ['$rootScope','$scope', 'GraphicChartsUtils', '$timeout',
      function ($rootScope, $scope, GraphicChartsUtils, $timeout) {
        /**
         * Depending on the type of the chart, returns the corresponding options
         */
        $timeout(function(){
          var graphs = GraphicChartsUtils.getGraphConfig();

          var type = $scope.type;
        switch (type){
          case 'geoChart':
            $scope.graphConfig = graphs['populations-model-selectionCriteria-countriesIso'];
          break;
          case 'studiesDesigns':
            $scope.graphConfig =  graphs['model-methods-design'];
          break;
          case 'numberParticipants' :
            $scope.graphConfig =graphs['model-numberOfParticipants-participant-number-range'];
          break;
          case 'biologicalSamples' :
            $scope.graphConfig = graphs['populations-dataCollectionEvents-model-bioSamples'];
          break;
          case 'startYear':
            $scope.graphConfig = graphs['model-startYear-range'];
          break;

            default:
              throw new Error('Invalid type: ' + type);
          }
        });
    }])
    .controller('VariableCoverageChartController', ['$scope', '$location', 'CoverageResource', 'D3ChartConfig', '$translate', function ($scope, $location, CoverageResource, D3ChartConfig, $translate) {
      function normalizeData(data) {
        data.sort(function(prev, curr) {
          return prev.values.length - curr.values.length;
        }).sort(function(prev, curr) {
          if (prev.key > curr.key) {
            return 1;
          }
          if (prev.key < curr.key) {
            return -1;
          }
          return 0;
        });
        // template with zero value
        var zeroValues = data.reduce(function (prev, curr) {
          return prev.values.length > curr.values.length ? prev : curr;
        }).values.map(function (v) {
          return { key: v.key, title: v.title, notEllipsedTitle: v.notEllipsedTitle, value: 0 };
        });

        // values normalization
        data.forEach(function (d) {
          var normalized = [];
          zeroValues.forEach(function (z) {
            var item = d.values.filter(function (value) { return value.title === z.title; }).pop();
            if(item && (item.itemTerm && item.itemTerm.length > 0)){
              item.itemTerm.forEach(function(itemTerm){
                normalized.push({
                  key: z.key,
                  value: itemTerm ? itemTerm.value : 0,
                  title: itemTerm.term,
                  notEllipsedTitle: z.notEllipsedTitle,
                  notEllipsedTermTitle: itemTerm.notEllipsedTitle,
                  link: itemTerm ? itemTerm.link : null
                });
              });
            }
            else{
              normalized.push({
                key: z.key,
                value: item ? item.value : 0,
                title: z.title,
                notEllipsedTitle: z.notEllipsedTitle,
                link: item ? item.link : null
              });
            }
          });

          d.values = normalized;
        });
      }

      function doNormalizationByType(chartData, type) {
        var data = [];

        if (type !== 'variable') {
          chartData.map(function (d) { return d.key; }).filter(function (f, i, arr) {
            return arr.indexOf(f) === i;
          }).forEach(function (k) {
            data.push({key: k, values: chartData.filter(function (f) { return f.key === k; })});
          });

          normalizeData(data);
        } else {
          data = chartData;
        }

        return data;
      }

      function getLabelMargin(data, horizontalBarChar) {
        if(horizontalBarChar){
          var maxVal = 0;
          var text = document.createElement("span");
          // Technique to get Text with in svg pattern
          document.body.appendChild(text);
          text.style.font = "arial";
          text.style.fontSize = 14 + "px";
          text.style.height = 'auto';
          text.style.width = 'auto';
          text.style.position = 'absolute';
          text.style.whiteSpace = 'no-wrap';

          data.forEach(function(dataEntry){
            var currentValMax;
            currentValMax =  d3.max(dataEntry.itemTerm, function(d) {
              text.textContent = d.term;
              return Math.ceil(text.clientWidth);
            });
            maxVal = currentValMax > maxVal ? currentValMax : maxVal;
          });
          return maxVal;
        }
        else{
          return  d3.max(data, function(d) {
            return Math.ceil(d.title.length);
          });
        }
      }

      function processConfig(config, type, data, colors, showLegend, renderOptions) {
        var horizontalBarChar = (renderOptions.graphicChartType === "multiBarHorizontalChart") ? true : false;
        var labelMargin = getLabelMargin(data, horizontalBarChar);
        config.options.chart.margin = {
          left: 200,
          top:20,
          right:50,
          bottom:50
        };
        if (type === 'variable') {
          if (!showLegend) {
            config.options.chart.margin = {top: 0, right:0, bottom: 0, left: 0}
          }

          config.withType('pieChart');
          config.options.chart.legendPosition = 'right';
          config.options.chart.legend = {
            margin : {
              top: 0,
              right:15,
              bottom: 0,
              left: 15
            }
          };
          config.options.chart.multibar = false;
          config.options.chart.groupSpacing = false;
          config.options.chart.stacked = false;
          config.options.chart.showLegend = showLegend;
          config.options.chart.showLabels = true;
          config.options.chart.labelThreshold = 0.05;
          config.options.chart.labelType =  function (d) {
            var percent = (d.endAngle - d.startAngle) / (2 * Math.PI);
            return d3.format('.2%')(percent);
          };
        } else {
          config.options.chart.wrapLabels = false;
          // re-generate the tooltips bar chart
          config.options.chart.tooltip.contentGenerator = function (o) {
              var series = o.series[0];
              if (series === null) { return; }

              var s = '',
                notEllipsedTermTitle = '',
                bottom = '<span>' + series.key + ': <strong>' + series.value + '</strong></span>';
            if(o.data.notEllipsedTermTitle){
              notEllipsedTermTitle = '<strong>' + o.data.notEllipsedTermTitle + '</strong><br/>';
            }
              if (o.value) {
                s = '<strong>' + o.data.notEllipsedTitle + '</strong><br/>';
              }

              return '<div class="chart-tooltip">' + s + notEllipsedTermTitle + bottom + '</div>';
            };
          // Configure when the x- labels have to be wrap
          if (renderOptions.nbrStack > 3 && renderOptions.nbrStack <= renderOptions.numberBars) {
            config.options.chart.wrapLabels = true;
          }
          // configure when the x-labels have to be rotated withe margin in graphics
          if(renderOptions.graphicMargins){
            config.options.chart.margin = renderOptions.graphicMargins;
          }
          if ((renderOptions.nbrStack > renderOptions.numberBars) && (renderOptions.graphicChartType!=='multiBarHorizontalChart')) {
            config.options.chart.rotateLabels = renderOptions.rotateLabels;
            config.options.chart.margin.left = renderOptions.graphicMargins.left + labelMargin;
            config.options.chart.margin.bottom = renderOptions.graphicMargins.bottom + labelMargin;
          } else {
            config.options.chart.margin.left = renderOptions.horizontalBarCharMarginLeft + labelMargin;
            if(data.reduce((max, b) => Math.max(max, b.value), data[0].value) < 5){
              config.options.chart.yAxis.ticks = data[0].value;
            }
          }
          config.options.chart.staggerLabels = true;
          config.options.chart.showLegend = false;

        }
        config.options.chart.color = colors;
        config.options.chart.height = 500;
        if(renderOptions.graphicHeight){
          config.options.chart.height = renderOptions.graphicHeight + config.options.chart.margin.bottom + config.options.chart.margin.top;
        }
        if(renderOptions.graphicChartType){
          config.options.chart.type = renderOptions.graphicChartType;
        }

        config.options.chart.autoMargins = false;

      }

      // type and id
      var absUrl = $location.absUrl();
      var re = /mica\/([a-z_-]+)\/([^\/#]+)/;
      var found = absUrl.match(re);

      if (found) {
        var type = found[1], id = found[2];
        if (type.indexOf('dataset') !== -1) {
          type = 'dataset';
        }

        if (type === 'variable') {
          id = decodeURIComponent(id);
        }

        // resource query
        var result = CoverageResource.get({type: type, id: id});

        $scope.d3Configs = [];
        result.$promise.then(function (res) {
          if(res.code && res.code !== 200){
              $translate(['data-coverage-error']).then(function(translate){
              $scope.message = translate['data-coverage-error'] + ' ' + res.code + ' ' + res.message;
            });
          }

          if(res.charts){
            res.charts.forEach(function (chart) {
              var chartData = (chart.data && chart.data.length ? chart.data : chart.variableData);

              if (chartData && chartData.length) {
                var data = doNormalizationByType(chartData, type);
                var config = new D3ChartConfig().withData(data, true).withTitle(chart.title).withSubtitle(chart.subtitle);
                processConfig(config, type, chartData, chart.color.colors, chart.showLegend, chart.renderOptions);
                $scope.d3Configs.push(config);
              }
            });
          }
        });
      }
    }]);
;
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
  }]);;
