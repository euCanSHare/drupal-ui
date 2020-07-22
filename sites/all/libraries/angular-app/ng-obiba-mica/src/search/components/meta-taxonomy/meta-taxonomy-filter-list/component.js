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

  function Controller() {
    var ctrl = this;

    function selectTaxonomy(taxonomy) {
      ctrl.onSelectTaxonomy({ target: ctrl.metaTaxonomy.name, taxonomy: taxonomy });
    }

    function getEntityType() {
      return targetToType(ctrl.metaTaxonomy.name);
    }

    function init() {
      ctrl.entityType = getEntityType();
    }

    ctrl.status = { isFirstOpen: true };
    ctrl.selectTaxonomy = selectTaxonomy;
    
    ctrl.$onInit = init;
  }

  ngObibaMica.search

    .component('metaTaxonomyFilterList', {
      transclude: true,
      bindings: {
        metaTaxonomy: '<',
        showTaxonomyPanel: '<',
        rqlQuery: '<',
        onSelectTaxonomy: '&'
      },
      templateUrl: 'search/components/meta-taxonomy/meta-taxonomy-filter-list/component.html',
      controller: Controller
    });
})();
