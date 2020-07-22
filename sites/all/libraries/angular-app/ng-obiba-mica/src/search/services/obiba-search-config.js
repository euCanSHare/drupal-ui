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
  function ObibaSearchConfig() {
    var options = {
      networks: {
        showSearchTab: 1
      },
      studies: {
        showSearchTab: 1
      },
      datasets: {
        showSearchTab: 1
      },
      variables: {
        showSearchTab: 1
      }
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
  }

  ngObibaMica.search.service('ObibaSearchConfig', ObibaSearchConfig);
})();