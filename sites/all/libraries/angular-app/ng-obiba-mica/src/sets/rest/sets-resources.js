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

(function () {
  ngObibaMica.sets
    .factory('SetsResource', ['$resource', 'ApplicationCacheService', 'ngObibaMicaUrl',
      function ($resource, ApplicationCacheService, ngObibaMicaUrl) {
        return $resource(ngObibaMicaUrl.getUrl('SetsResource'), {}, {
          'save': {
            method: 'POST',
            params: {type: '@type'},
            errorHandler: true,
            transformResponse: (data) => {
              ApplicationCacheService.clearCache('taxonomyResource');
              ApplicationCacheService.clearCache('taxonomiesResource');
              return JSON.parse(data);
            }
          }
        });
      }])

    .factory('SetsImportResource', ['$resource', 'ApplicationCacheService', 'ngObibaMicaUrl',
      function ($resource, ApplicationCacheService, ngObibaMicaUrl) {
        return $resource(ngObibaMicaUrl.getUrl('SetsImportResource'), {}, {
          'save': {
            method: 'POST',
            params: {type: '@type'},
            headers: {'Content-Type': 'text/plain'},
            errorHandler: true,
            transformResponse: (data) => {
              ApplicationCacheService.clearCache('taxonomyResource');
              ApplicationCacheService.clearCache('taxonomiesResource');
              return JSON.parse(data);
            }
          }
        });
      }]);
})();
