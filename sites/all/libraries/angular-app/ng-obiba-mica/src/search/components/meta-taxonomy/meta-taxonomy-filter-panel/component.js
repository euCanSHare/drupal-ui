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

(function() {

  function Controller(MetaTaxonomyService, TaxonomyService, $timeout) {
    var ctrl = this;
    /**
     * Retrieves all meta taxonomies
     */
    function init() {
      MetaTaxonomyService.getMetaTaxonomyForTargets(ctrl.tabs).then(function (metaTaxonomies) {
        ctrl.metaTaxonomies = metaTaxonomies;
      });
    }

    function onSelectTaxonomy(target, selectedTaxonomy) {
      if (ctrl.selectedTaxonomy !== selectedTaxonomy) {
        if (ctrl.selectedTaxonomy) {
          ctrl.selectedTaxonomy.state.inactive();
        }

        ctrl.selectedTaxonomy = selectedTaxonomy;
        ctrl.selectedTaxonomy.state.active();
        ctrl.selectedTaxonomy.state.loading();

        // enough delay for UI rendering
        $timeout(function() {
          TaxonomyService.getTaxonomies(target, selectedTaxonomy.info.names || selectedTaxonomy.info.name)
            .then(function (taxonomy) {
              ctrl.selectedTaxonomy.state.loaded();
              ctrl.onToggle({target: target, taxonomy: taxonomy});
            });
        });

      } else {
        ctrl.selectedTaxonomy.state.none();
        ctrl.selectedTaxonomy = null;
        ctrl.onToggle({target: target, taxonomy: ctrl.selectedTaxonomy});
      }
    }

    function onChanges(changed) {
      if (ctrl.selectedTaxonomy && changed.showTaxonomyPanel && changed.showTaxonomyPanel.currentValue !== true) {
        ctrl.selectedTaxonomy.state.none();
        ctrl.selectedTaxonomy = null;
      }
    }

    ctrl.selectedTaxonomy = null;
    ctrl.onSelectTaxonomy = onSelectTaxonomy;
    ctrl.$onChanges = onChanges;
    ctrl.$onInit = init;
  }

  ngObibaMica.search
    .component('metaTaxonomyFilterPanel', {
      bindings: {
        tabs: '<',
        showTaxonomyPanel: '<',
        onToggle: '&',
        rqlQuery: '<'
      },
      templateUrl: 'search/components/meta-taxonomy/meta-taxonomy-filter-panel/component.html',
      controller: ['MetaTaxonomyService', 'TaxonomyService', '$timeout', Controller]
    });
})();

