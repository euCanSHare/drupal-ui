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
  function PaginationService (ngObibaMicaSearch) {
    var listeners = {};
    var states = Object.keys (QUERY_TARGETS).reduce (function (acc, key) {
      if (null === /TAXONOMY/.exec(key)) {
        var target = QUERY_TARGETS[key];
        acc[target] = new ngObibaMica.search.PaginationState (target, ngObibaMicaSearch.getDefaultListPageSize (target));
      }

      return acc;
    }, {});


    function update (pagination, results) {
      var preventPaginationEvent = false;
      var target;

      for (target in states) {
        var state = states[target];
        var hits = results[target + 'TotalCount'].hits || 0;
        var targetPagination = pagination[target];
        var totalHitsChanged = state.totalHitsChanged(hits);
        preventPaginationEvent = preventPaginationEvent || totalHitsChanged;
        state.update (targetPagination, hits);
      }

      for (target in states) {
        if (listeners[target] && Array.isArray(listeners[target])) {
          listeners[target].forEach((listener) => listener.onUpdate(states[target].data(), preventPaginationEvent));
        }
      }
    }

    function registerListener(target, listener) {
      if (listener) {
       if (!listener.onUpdate) {
         throw new Error('PaginationService::registerListener() - listener must implement onUpdate()');
       }

       listeners[target] = [].concat(listeners[target] || [], listener);
      }
    }

    this.registerListener = registerListener;
    this.update = update;
  }

  ngObibaMica.search.service ('PaginationService', ['ngObibaMicaSearch', PaginationService]);
}) ();