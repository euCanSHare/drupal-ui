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

ngObibaMica.sets
  .config(['$routeProvider',
    function ($routeProvider) {

      var optionsResolve = ['ngObibaMicaSearch', function (ngObibaMicaSearch) {
        return ngObibaMicaSearch.getOptionsAsyn();
      }];

      $routeProvider
        .when('/cart', {
          templateUrl: 'sets/views/cart.html',
          controller: 'CartController',
          reloadOnSearch: false,
          resolve: {
            ObibaSearchOptions: optionsResolve
          }
        })
        .when('/sets', {
          templateUrl: 'sets/views/sets.html',
          controller: 'SetsController',
          reloadOnSearch: false,
          resolve: {
            ObibaSearchOptions: optionsResolve
          }
        });
    }]);
