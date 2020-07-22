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

  ngObibaMica.search
    .factory('TaxonomiesResource', ['$resource', 'ngObibaMicaUrl', '$cacheFactory', 'SetService', '$translate',
      function ($resource, ngObibaMicaUrl, $cacheFactory, SetService, $translate) {
        return $resource(ngObibaMicaUrl.getUrl('TaxonomiesResource'), {}, {
          'get': {
            method: 'GET',
            isArray: true,
            errorHandler: true,
            cache: $cacheFactory('taxonomiesResource'),
            transformResponse: (data) => {
              var parsedData = JSON.parse(data);

              parsedData.filter((taxonomy) => taxonomy.name.startsWith('Mica_')).forEach((micaTaxonomy) => {
                TaxonomyCartFilter.filter(SetService, micaTaxonomy, $translate);
              });

              return parsedData;
            }
          }
        });
      }]);
})();
