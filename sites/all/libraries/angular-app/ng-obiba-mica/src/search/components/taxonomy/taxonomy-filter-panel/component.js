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
  function TaxonomyFilterPanelController(VocabularyService, $timeout) {
    var ctrl = this;
    ctrl.taxonomiesQuery = [];
    ctrl.classClose = false;
    function taxonomyArrayName(taxonomy) {
      return taxonomy.reduce(function (name, taxonomyItem) {
        return (name || '').concat(taxonomyItem.name);
      }, '');
    }

    function getStringQueryByTaxonomy(taxonomyName) {
      var taxonomies = ctrl.taxonomiesQuery.filter(function (taxonomy) {
        return taxonomy.name === taxonomyName;
      });
      return taxonomies.length === 1 ? taxonomies[0].queryString : null;
    }

    function updateQueryString(taxonomy, queryString) {
      var updated = false;
      if (taxonomy !== undefined && queryString !== undefined) {
        ctrl.taxonomiesQuery.forEach(function (taxonomyQuery) {
          if (taxonomyQuery.name === taxonomy && taxonomyQuery.queryString !== undefined) {
            taxonomyQuery.queryString = queryString;
            updated = true;
          }
        });
        if (!updated) {
          ctrl.taxonomiesQuery.push({ name: taxonomy, queryString: queryString });
        }
      }
      ctrl.taxonomiesQuery.filter(function (taxonomyQuery) {
        return taxonomyQuery.queryString;
      });
    }

    function selectTaxonomyVocabularyArgs(taxonomy, vocabulary, args) {
      ctrl.onSelectTerm({ target: ctrl.target, taxonomy: taxonomy, vocabulary: vocabulary, args: args });
    }

    function onFilterChange(queryString) {
      var taxoName;
      if (!ctrl.taxonomyIsArray) {
        taxoName = ctrl.taxonomy.name;
        filterChangedForSingleTaxonomy(queryString);
      } else {
        taxoName = taxonomyArrayName(ctrl.taxonomy);
        filterChangedForMultipleTaxonomies(queryString);
      }
      updateQueryString(taxoName, queryString);
    }

    function filterChangedForSingleTaxonomy(queryString) {
      if (queryString) {
        ctrl.filteredVocabularies = VocabularyService.filter(ctrl.taxonomy.vocabularies, queryString);
      } else {
        ctrl.filteredVocabularies = initFilteredVocabularies(ctrl.taxonomy);
      }
    }

    function filterChangedForMultipleTaxonomies(queryString) {
      ctrl.filteredVocabularies = {};
      if (queryString) {
        ctrl.taxonomy.forEach(function (subTaxonomy) {
          var filtredSubVocabularies = VocabularyService.filter(subTaxonomy, queryString);
          if (filtredSubVocabularies.length > 0) {
            ctrl.filteredVocabularies[subTaxonomy.name] = filtredSubVocabularies;
          }
        });
      } else {
        ctrl.taxonomy.forEach(function (subTaxonomy) {
          ctrl.filteredVocabularies[subTaxonomy.name] = initFilteredVocabularies(subTaxonomy);
        });
      }
    }

    function togglePannel() {
      ctrl.classClose = true;
      $timeout(function () {
        ctrl.onToggle(ctrl.target, null);
      }, 200);
    }

    function initFilteredVocabularies(taxonomy) {
      return taxonomy.vocabularies.map(function (vocabulary) {
        vocabulary.filteredTerms = vocabulary.terms;
        return vocabulary;
      });
    }

    function onChanges(changesObj) {
      ctrl.taxonomyIsArray = Array.isArray(ctrl.taxonomy);
      ctrl.taxonomyName = !ctrl.taxonomyIsArray ? ctrl.taxonomy.name : taxonomyArrayName(ctrl.taxonomy);
      if (changesObj.taxonomy) {
        var queryString = getStringQueryByTaxonomy(ctrl.taxonomyName);
        if (queryString) {
          onFilterChange(queryString);
        }
        else {
          onFilterChange();
        }
      }
    }

    function removeCriterion(item) {
      ctrl.onRemoveCriterion({ item: item });
    }

    function selectType(type) {
      togglePannel();
      ctrl.onSelectType({ type: type });
    }

    ctrl.$onChanges = onChanges;
    ctrl.selectTaxonomyVocabularyArgs = selectTaxonomyVocabularyArgs;
    ctrl.selectType = selectType;
    ctrl.onFilterChange = onFilterChange;
    ctrl.togglePannel = togglePannel;
    ctrl.removeCriterion = removeCriterion;
  }

  ngObibaMica.search
    .component('taxonomyFilterPanel', {
      transclude: true,
      bindings: {
        showTaxonomyPanel: '<',
        result: '<',
        resultTabsOrder: '<',
        taxonomyTypeMap: '<',
        target: '<',
        taxonomy: '<',
        onSelectType: '&',
        onSelectTerm: '&',
        onRemoveCriterion: '&',
        onToggle: '<'
      },
      templateUrl: 'search/components/taxonomy/taxonomy-filter-panel/component.html',
      controller: ['VocabularyService', '$timeout', TaxonomyFilterPanelController]
    });
})();
