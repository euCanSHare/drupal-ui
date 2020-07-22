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
  function InputSearchFilterController() {
    var ctrl = this;

    function change() {
      ctrl.onFilterChange({ queryString: ctrl.queryString });
    }
    function clear() {
      ctrl.queryString = '';
      change();
    }

    function onChanges(changesObj) {
      if (changesObj.taxonomyName) {
        var updateQueryString = false;
        ctrl.taxonomiesQuery.forEach(function (taxonomy) {
          if (taxonomy.name === ctrl.taxonomyName && taxonomy.queryString) {
            ctrl.queryString = taxonomy.queryString;
            updateQueryString = true;
          }
        });
        if (!updateQueryString) {
          ctrl.queryString = '';
        }
      }
    }

    ctrl.$onChanges = onChanges;
    ctrl.change = change;
    ctrl.clear = clear;
  }

  ngObibaMica.search
    .component('inputSearchFilter', {
      transclude: true,
      bindings: {
        taxonomiesQuery: '<',
        taxonomyName: '<',
        queryString: '<',
        onFilterChange: '&'
      },
      templateUrl: 'search/components/input-search-filter/component.html',
      controller: [InputSearchFilterController]
    });
})();
