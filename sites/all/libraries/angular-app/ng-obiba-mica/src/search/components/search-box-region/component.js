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

  function Controller(
    $translate,
    VocabularyService, 
    RqlQueryService, 
    AlertService, 
    StringUtils,
    LocaleStringUtils, 
    ServerErrorUtils, 
    TaxonomiesSearchResource) {

    var ctrl = this;
    // vocabulary (or term) can be used in search if it doesn't have the 'showSearch' attribute
    function canSearch(taxonomyEntity, hideSearchList) {
      if ((hideSearchList || []).indexOf(taxonomyEntity.name) > -1) {
        return false;
      }

      return (taxonomyEntity.attributes || []).filter(function (attr) { return attr.key === 'showSearch'; }).length === 0;
    }

    function score(query, item) {
      var result = 0;
      var regExp = new RegExp(query, 'ig');

      if (item.itemTitle.match(regExp)) {
        result = 10;
      } else if (item.itemDescription && item.itemDescription.match(regExp)) {
        result = 8;
      } else if (item.itemParentTitle.match(regExp)) {
        result = 6;
      } else if (item.itemParentDescription && item.itemParentDescription.match(regExp)) {
        result = 4;
      }

      return result;
    }

    function processBundle(query, bundle) {
      var results = [];
      var total = 0;
      var target = bundle.target;
      var taxonomy = bundle.taxonomy;
      if (taxonomy.vocabularies) {
        taxonomy.vocabularies.filter(function (vocabulary) {
          return VocabularyService.isVisibleVocabulary(vocabulary) && canSearch(vocabulary, ctrl.hideSearch);
        }).forEach(function (vocabulary) {
          if (vocabulary.terms) {
            vocabulary.terms.filter(function (term) {
              return canSearch(term, ctrl.hideSearch);
            }).forEach(function (term) {
              var item = RqlQueryService.createCriteriaItem(target, taxonomy, vocabulary, term, ctrl.lang);
              results.push({
                score: score(query, item),
                item: item
              });
              total++;
            });
          } else {
            var item = RqlQueryService.createCriteriaItem(target, taxonomy, vocabulary, null, ctrl.lang);
            results.push({
              score: score(query, item),
              item: item
            });
            total++;
          }
        });
      }
      return { results: results, total: total };
    }

    function searchCriteria(query) {
      // search for taxonomy terms
      // search for matching variables/studies/... count

      var criteria = TaxonomiesSearchResource.get({
        query: StringUtils.quoteQuery(query.replace(/\/.*/g, '')),
        locale: ctrl.lang,
        target: ctrl.documents.search.target
      }).$promise.then(function (response) {
        if (response) {
          var results = [];
          var total = 0;
          var size = 10;

          response.forEach(function (bundle) {
            var rval = processBundle(query, bundle);
            results.push.apply(results, rval.results);
            total = total + rval.total;
          });

          results.sort(function (a, b) {
            return b.score - a.score;
          });

          results = results.splice(0, size);

          if (total > results.length) {
            var note = {
              query: query,
              total: total,
              size: size,
              message: LocaleStringUtils.translate('search.showing', [size, total]),
              status: 'has-warning'
            };
            results.push({ score: -1, item: note });
          }

          return results.map(function (result) {
            return result.item;
          });
        } else {
          return [];
        }
      }, function (response) {
        AlertService.alert({
          id: ctrl.alertId,
          type: 'danger',
          msg: ServerErrorUtils.buildMessage(response),
          delay: 5000
        });
      });

      return criteria;
    }

    function showTaxonomy(target, name) {
      if (ctrl.target === target && ctrl.taxonomyName === name && ctrl.taxonomiesShown) {
        ctrl.taxonomiesShown = false;
        return;
      }

      ctrl.taxonomiesShown = true;
      ctrl.target = target;
      ctrl.taxonomyName = name;
    }

    function clearTaxonomy() {
      ctrl.target = null;
      ctrl.taxonomyName = null;
    }

    function selectSearchTarget(target) {
      ctrl.documents.search.target = target;
    }

    function selectCriteria(item) {
      ctrl.onSelectCriteria({item: item});
      ctrl.selectedCriteria = null;
    }

    function translateTaxonomyNav(taxonomy, key) {
      var value = taxonomy[key] && taxonomy[key].filter(function (item) {
        return item.locale === $translate.use();
      }).pop();

      return value ? value.text : key;
    }

    function goToClassifications() {
      ctrl.onGotoClassifications({});
    }

    function selectTerm(target, taxonomy, vocabulary, args) {
      ctrl.onSelectTerm({target: target, taxonomy: taxonomy, vocabulary: vocabulary, args: args});
    }

    ctrl.selectedCriteria = null;
    ctrl.target = null;
    ctrl.documents = {
      search: {
        text: null,
        active: false,
        target: null
      }
    };

    ctrl.selectCriteria = selectCriteria;
    ctrl.searchCriteria = searchCriteria;
    ctrl.selectSearchTarget = selectSearchTarget;
    ctrl.clearTaxonomy = clearTaxonomy;
    ctrl.showTaxonomy = showTaxonomy;
    ctrl.translateTaxonomyNav = translateTaxonomyNav;
    ctrl.goToClassifications = goToClassifications;
    ctrl.selectTerm = selectTerm;
  }

  ngObibaMica.search.component('searchBoxRegion',
    {
      // transclude: true,
      bindings: {
        targets: '<',
        options: '<',
        alertId: '@',
        lang: '<',
        taxonomyNav: '<',
        onSelectCriteria: '&',
        onGotoClassifications: '&',
        onSelectTerm: '&'
      },
      templateUrl: 'search/components/search-box-region/component.html',
      controller: [
        '$translate',
        'VocabularyService',
        'RqlQueryService',
        'AlertService',
        'StringUtils',
        'LocaleStringUtils',
        'ServerErrorUtils',
        'TaxonomiesSearchResource',
        Controller]
    });

})();
