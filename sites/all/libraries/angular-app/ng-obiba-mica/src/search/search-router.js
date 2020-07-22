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

ngObibaMica.search
  .config(['$routeProvider',
    function ($routeProvider) {
      // This will be used to delay the loading of the search config until the options are all resolved; the result is
      // injected to the SearchController.
      var optionsResolve = ['ngObibaMicaSearch', function (ngObibaMicaSearch) {
        return ngObibaMicaSearch.getOptionsAsyn();
      }];

      $routeProvider
        .when('/search', {
          templateUrl: 'search/views/search-layout.html',
          controller: 'SearchController',
          reloadOnSearch: false,
          resolve: {
            options: optionsResolve
          }
        })
        .when('/classifications', {
          templateUrl: 'search/views/classifications.html',
          controller: 'SearchController',
          reloadOnSearch: false,
          resolve: {
            options: optionsResolve
          }
        });
    }]);
