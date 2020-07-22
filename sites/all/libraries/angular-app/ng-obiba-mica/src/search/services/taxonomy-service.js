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

  function TaxonomyService($q, TaxonomiesResource, TaxonomyResource, VocabularyService) {

    /**
     * @returns Returns a taxonomy
     */
    function getTaxonomy(target, taxonomyName) {
      return TaxonomyResource.get({
        target: target,
        taxonomy: taxonomyName
      }).$promise;
    }

    function getTaxonomiesInternal(target, taxonomyNames) {
      return TaxonomiesResource.get({
        target: target,
        query: 'taxonomyName:' + taxonomyNames.join(' OR taxonomyName:')
      }).$promise;
    }

    function sortTaxonomies(order, taxonomies) {
      taxonomies.sort(function (a, b) {
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
    }

    function findVocabularyInTaxonomy(target, taxonomyName, vocabularyName) {
      var deferred = $q.defer();
      var foundVocabulary = null;
      TaxonomyResource.get({
        target: target,
        taxonomy: taxonomyName
      }).$promise.then(function (taxonomy) {
        taxonomy.vocabularies.some(function (v) {
          if (v.name === vocabularyName || VocabularyService.vocabularyAlias(v) === vocabularyName) {
            foundVocabulary = v;
            return true;
          }
        });

        deferred.resolve(foundVocabulary);
      });

      return deferred.promise;
    }

    /**
     * @returns Returns a taxonomy for several names
     */
    function getTaxonomies(target, taxonomyNames) {
      var deferred = $q.defer();
      if (Array.isArray(taxonomyNames)) {
        getTaxonomiesInternal(target, taxonomyNames).then(function (taxonomies) {
          taxonomies.forEach(function (taxonomy) {
            taxonomy.vocabularies = VocabularyService.visibleVocabularies(taxonomy.vocabularies);
          });
          sortTaxonomies(taxonomyNames, taxonomies);
          deferred.resolve(taxonomies);
        });
      } else {
        getTaxonomy(target, taxonomyNames).then(function (taxonomy) {
          taxonomy.vocabularies = VocabularyService.visibleVocabularies(taxonomy.vocabularies);
          deferred.resolve(taxonomy);
        });
      }

      return deferred.promise;
    }

    this.findVocabularyInTaxonomy = findVocabularyInTaxonomy;
    this.getTaxonomy = getTaxonomy;
    this.getTaxonomies = getTaxonomies;
  }

  ngObibaMica.search
    .service('TaxonomyService',
      ['$q', 'TaxonomiesResource', 'TaxonomyResource', 'VocabularyService', TaxonomyService]);

})();