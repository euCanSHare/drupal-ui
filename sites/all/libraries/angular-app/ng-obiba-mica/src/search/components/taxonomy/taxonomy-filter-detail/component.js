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
  function TaxonomyFilterDetailController() {
    var ctrl = this;

    function selectVocabularyArgs(vocabulary, args) {
      ctrl.onSelectTaxonomyTerm({ taxonomy: ctrl.taxonomy, vocabulary: vocabulary, args: args });
    }

    function removeCriterion(item) {
      ctrl.onRemoveCriterion({ item: item });
    }

    ctrl.selectVocabularyArgs = selectVocabularyArgs;
    ctrl.removeCriterion = removeCriterion;
  }

  ngObibaMica.search
    .component('taxonomyFilterDetail', {
      bindings: {
        taxonomy: '<',
        vocabularies: '<',
        onSelectTaxonomyTerm: '&',
        onRemoveCriterion: '&'
      },
      templateUrl: 'search/components/taxonomy/taxonomy-filter-detail/component.html',
      controller: [TaxonomyFilterDetailController]
    });
})();
