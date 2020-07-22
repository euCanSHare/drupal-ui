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

// SetService filter out other carts

(function () {
  ngObibaMica.search
    .factory('TaxonomyResource', ['$resource', 'ngObibaMicaUrl', '$cacheFactory', 'SetService', '$translate',
      function ($resource, ngObibaMicaUrl, $cacheFactory, SetService, $translate) {
        return $resource(ngObibaMicaUrl.getUrl('TaxonomyResource'), {}, {
          'get': {
            method: 'GET',
            errorHandler: true,
            cache: $cacheFactory('taxonomyResource'),
            transformResponse: (data) => {
              var taxonomy = JSON.parse(data);

              if (taxonomy.name.startsWith('Mica_') && !taxonomy.name.endsWith('_taxonomy')) {
                TaxonomyCartFilter.filter(SetService, taxonomy, $translate);
              }

              return taxonomy;
            }
          }
        });
      }]);
})();
