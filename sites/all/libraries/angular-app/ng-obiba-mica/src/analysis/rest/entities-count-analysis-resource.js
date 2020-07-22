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

  ngObibaMica.search.factory('EntitiesCountResource', ['$resource', 'ngObibaMicaUrl',
    function ($resource, ngObibaMicaUrl) {
      var resourceUrl = ngObibaMicaUrl.getUrl('EntitiesCountResource');
      var method = resourceUrl.indexOf(':query') === -1 ? 'POST' : 'GET';
      var contentType = method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json';
      var requestTransformer = function (obj) {
        var str = [];
        for (var p in obj) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
        return str.join('&');
      };
      return $resource(resourceUrl, {}, {
        'get': {
          method: method,
          headers: {
            'Content-Type': contentType
          },
          transformRequest: requestTransformer,
          errorHandler: true
        }
      });
    }]);
})();
