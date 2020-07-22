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

ngObibaMica.access
  .factory('DataAccessFormConfigResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessFormConfigResource'), {}, {
        'get': { method: 'GET', errorHandler: true }
      });
    }])

  .factory('DataAccessAmendmentFormConfigResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessAmendmentFormConfigResource'), {}, {
        'get': { method: 'GET', errorHandler: true }
      });
    }])

  .factory('DataAccessRequestsResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestsResource'), {}, {
        'save': { method: 'POST', errorHandler: true },
        'get': { method: 'GET' }
      });
    }])

  .factory('DataAccessRequestsExportCsvResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestsExportCsvResource'), {}, {
        'get': { method: 'GET' }
      });
    }])

  .factory('DataAccessRequestResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestResource'), {}, {
        'save': { method: 'PUT', params: { id: '@id' }, errorHandler: true },
        'editStartDate': { method: 'PUT', params: { id: '@id', date: '@date' }, url: ngObibaMicaUrl.getUrl('DataAccessRequestStartDateResource'), errorHandler: true },
        'editActionLogs': { method: 'PUT', params: { id: '@id' }, url: ngObibaMicaUrl.getUrl('DataAccessRequestActionLogsResource'), errorHandler: true },
        'get': { method: 'GET' },
        'delete': { method: 'DELETE' }
      });
    }])

  .factory('DataAccessAmendmentsResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessAmendmentsResource'), {}, {
        'save': { method: 'POST', params: { parentId: '@parentId' }, errorHandler: true },
        'get': { method: 'GET', params: { parentId: '@parentId' } },
        'getLogHistory': { method: 'GET', isArray: true, url: ngObibaMicaUrl.getUrl('DataAccessAmendmentsLogHistoryResource') }
      });
    }])

  .factory('DataAccessAmendmentResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessAmendmentResource'), {}, {
        'save': { method: 'PUT', params: { parentId: '@parentId', id: '@id' }, errorHandler: true },
        'get': { method: 'GET' },
        'delete': { method: 'DELETE' }
      });
    }])

  .factory('DataAccessRequestAttachmentsUpdateResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestAttachmentsUpdateResource'), {}, {
        'save': { method: 'PUT', params: { id: '@id' }, errorHandler: true }
      });
    }])

  .factory('DataAccessRequestCommentsResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestCommentsResource'), {}, {
        'save': {
          method: 'POST',
          params: { id: '@id', admin: '@admin' },
          headers: { 'Content-Type': 'text/plain' },
          errorHandler: true
        },
        'get': { method: 'GET', params: { id: '@id', admin: '@admin' }, errorHandler: true }
      });
    }])

  .factory('DataAccessRequestCommentResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestCommentResource'), {}, {
        'delete': {
          method: 'DELETE',
          params: { id: '@id', commentId: '@commentId' },
          errorHandler: true
        },
        'update': {
          method: 'PUT',
          params: { id: '@id', commentId: '@commentId' },
          headers: { 'Content-Type': 'text/plain' },
          errorHandler: true
        }
      });
    }])

  .factory('DataAccessRequestStatusResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessRequestStatusResource'), {}, {
        'update': {
          method: 'PUT',
          params: { id: '@id', status: '@status' },
          errorHandler: true
        }
      });
    }])

  .factory('DataAccessAmendmentStatusResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      return $resource(ngObibaMicaUrl.getUrl('DataAccessAmendmentStatusResource'), {}, {
        'update': {
          method: 'PUT',
          params: { id: '@id', parentId: '@parentId', status: '@status' },
          errorHandler: true
        }
      });
    }])

  .service('DataAccessRequestConfig', function () {
    var options = {
      newRequestButtonCaption: null,
      documentsSectionTitle: null,
      documentsSectionHelpText: null,
      downloadButtonCaption: null,
      commentsEnabled: true,
      userListPageTitle: null,
      newRequestButtonHelpText: null
    };

    this.setOptions = function (newOptions) {
      if (typeof (newOptions) === 'object') {
        Object.keys(newOptions).forEach(function (option) {
          if (option in options) {
            options[option] = newOptions[option];
          }
        });
      }
    };

    this.getOptions = function () {
      return angular.copy(options);
    };

  })

  .service('DataAccessRequestDirtyStateService', [
    function () {
      var form = null;

      this.setForm = function (f) {
        form = f;
      };

      this.isDirty = function () {
        return form && form.$dirty;
      };
    }])


  .filter('filterProfileAttributes', function () {
    return function (attributes) {
      var exclude = ['email', 'firstName', 'lastName', 'createdDate', 'lastLogin', 'username'];
      return attributes.filter(function (attribute) {
        return exclude.indexOf(attribute.key) === - 1;
      });
    };
  })

  .filter('capitalizeFirstLetter', ['StringUtils', function (StringUtils) {
    return function (text) {
      return StringUtils.capitaliseFirstLetter(text);
    };
  }]);
