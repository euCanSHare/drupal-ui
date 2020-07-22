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
  function EntityCountsController() {
    var ctrl = this;
    function getTotalHits(entity) {
      if (!ctrl.result || !ctrl.result[entity + 'TotalCount']) {
        return '';
      }

      return ctrl.result[entity + 'TotalCount'].hits;
    }

    function selectType(entity) {
      ctrl.onSelectType({ type: targetToType(entity) });
    }

    ctrl.getTotalHits = getTotalHits;
    ctrl.selectType = selectType;
  }

  ngObibaMica.search
    .component('entityCounts', {
      transclude: true,
      bindings: {
        result: '<',
        target: '<',
        onSelectType: '&',
        resultTabsOrder: '<',
        taxonomyTypeMap: '<'
      },
      templateUrl: 'search/components/entity-counts/component.html',
      controller: [EntityCountsController]
    });

})();
