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
  function VocabularyFilterDetailController(VocabularyService) {
    var ctrl = this;

    function checkAndSetCriterionType(vocabulary) {
      if (VocabularyService.isTermsVocabulary(vocabulary) || VocabularyService.isRangeVocabulary(vocabulary)) {
        ctrl.criterionType = 'string-terms';
      } else if (VocabularyService.isNumericVocabulary(vocabulary)) {
        ctrl.criterionType = 'numeric';
      } else if (VocabularyService.isMatchVocabulary(vocabulary)) {
        ctrl.criterionType = 'match';
      }
    }

    function selectVocabularyArgs(args) {
      if (ctrl.criterionType === 'string-terms' && !args.term.selected) {
        var selectedTerms = ctrl.vocabulary.terms.filter(function (term) {
          return term.selected;
        });

        if (selectedTerms.length === 0) {
          ctrl.onRemoveCriterion({ item: ctrl.vocabulary.existingItem });
        } else {
          ctrl.onSelectVocabularyArgs({ vocabulary: ctrl.vocabulary, args: args });
        }
      } else {
        ctrl.onSelectVocabularyArgs({ vocabulary: ctrl.vocabulary, args: args });
      }     
    }

    function removeCriterion() {
      ctrl.onRemoveCriterion({ item: ctrl.vocabulary.existingItem });
    }

    function selectAllFilteredVocabularyTerms(terms) {
      var processedTerms = terms.map(function (term) {
        term.selected = true;
        return term;
      });

      selectVocabularyArgs({ term: processedTerms });
    }

    function canStillSelectMore(terms) {
      if (!Array.isArray(terms)) {
        return false;
      }
      var selected = terms.filter(function (term) { return term.selected; });
      return selected.length < terms.length;
    }

    function onChanges(changesObj) {
      if (changesObj.vocabulary) {
        checkAndSetCriterionType(ctrl.vocabulary);
      }
    }

    ctrl.$onChanges = onChanges;
    ctrl.canStillSelectMore = canStillSelectMore;
    ctrl.selectAllFilteredVocabularyTerms = selectAllFilteredVocabularyTerms;
    ctrl.selectVocabularyArgs = selectVocabularyArgs;
    ctrl.removeCriterion = removeCriterion;
  }

  ngObibaMica.search
    .component('vocabularyFilterDetail', {
      transclude: true,
      bindings: {
        vocabulary: '<',
        onSelectVocabularyArgs: '&',
        onRemoveCriterion: '&'
      },
      templateUrl: 'search/components/vocabulary/vocabulary-filter-detail/component.html',
      controller: ['VocabularyService', VocabularyFilterDetailController]
    });
})();
