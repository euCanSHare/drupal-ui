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

  function VocabularyService($translate, LocalizedValues, MetaTaxonomyService) {

    const TOKEN_LENGTH = 1;

    var VOCABULARY_TYPES = {
      STRING: 'string',
      INTEGER: 'integer',
      DECIMAL: 'decimal',
      KEYWORD: 'keyword'
    };

    function translateField(title) {
      return LocalizedValues.forLocale(title, $translate.use());
    }

    function asciiFold(text) {
      return text.normalize('NFD').replace(/\//g, ' ').replace(/[^\w|^\s|^-]/g, '');
    }

    /**
     * Filters the list of vocabularies based on a query string. A leading '-' will negate the filter result.
     *
     * @param vocabularies
     * @param queryString
     * @returns filtered vocabularies
     */
    function filter(vocabularies, queryString) {
      if (queryString) {
        var tokens = asciiFold(queryString).toLowerCase().split(' ').filter(function (token) {
          return token.length > TOKEN_LENGTH;
        });

        var vocabulariesToFilter = Array.isArray(vocabularies) ? vocabularies : vocabularies.vocabularies;
        var fieldsToFilter = MetaTaxonomyService.getTaxonomyPanelOptions().fieldsToFilter;

        return (vocabulariesToFilter || []).filter(function (vocabulary) {
          vocabulary.filteredTerms = (vocabulary.terms || []).filter(function (term) {
            // Filter on configurable field
            var toMatchField = fieldsToFilter.reduce(function (toMatchField, field) {
              return toMatchField + ' ' + translateField(term[field]);
            }, fieldsToFilter[0]);
            // term is selected when each of the token is included
            var toMatch = asciiFold(toMatchField).trim().toLowerCase();
            return tokens.map(function (token) {
              if (token.startsWith('-')) {
                var ntoken = token.substr(1);
                if (ntoken.length <= TOKEN_LENGTH) {
                  return true;
                }
                return toMatch.indexOf(ntoken) === -1;
              }
              return toMatch.indexOf(token) >= 0;
            }).reduce(function (acc, val) {
              return acc && val;
            }, true);

          });

          return vocabulary.terms ? vocabulary.filteredTerms.length > 0 : true;
        });
      }
    }

    function isVocabularyVisible(vocabulary) {
      if (!vocabulary) {
        return false;
      }

      var hidden = vocabulary.attributes ? vocabulary.attributes.filter(function (a) {
        return a.key === 'hidden';
      }).pop() : null;

      return !hidden || hidden.value === 'false';
    }

    function isFacetVocabularyVisible(vocabulary) {
      if (!vocabulary || !vocabulary.attributes) {
        return false;
      }

      var result = vocabulary.attributes.filter(function (attribute) {
        return ['hidden', 'facet'].indexOf(attribute.key) > -1;
      }).reduce(function (a, i) {
        a[i.key] = i.value;
        return a;
      }, {});

      return 'true' === result.facet && (!result.hidden || 'false' === result.hidden);
    }

    function findVocabularyAttributes(vocabulary, pattern) {
      return (vocabulary.attributes || []).filter(function (attribute) {
        return attribute.key.search(pattern) > -1;
      }).reduce(function (a, i) {
        a[i.key] = i.value;
        return a;
      }, {});
    }

    function vocabularyAttributeValue(vocabulary, key, defaultValue) {
      var value = defaultValue;
      if (vocabulary.attributes) {
        vocabulary.attributes.some(function (attribute) {
          if (attribute.key === key) {
            value = attribute.value;
            return true;
          }

          return false;
        });
      }

      return value;
    }

    function visibleVocabularies(vocabularies) {
      return (vocabularies || []).filter(isVocabularyVisible);
    }

    function visibleFacetVocabularies(vocabularies) {
      return (vocabularies || []).filter(isFacetVocabularyVisible);
    }

    function vocabularyType(vocabulary) {
      return vocabularyAttributeValue(vocabulary, 'type', VOCABULARY_TYPES.STRING);
    }

    function vocabularyField(vocabulary) {
      return vocabularyAttributeValue(vocabulary, 'field', vocabulary.name);
    }

    function vocabularyAlias(vocabulary) {
      return vocabularyAttributeValue(vocabulary, 'alias', vocabulary.name);
    }

    function vocabularyTermsSortKey(vocabulary) {
      return vocabularyAttributeValue(vocabulary, 'termsSortKey', null);
    }

    function isTermsVocabulary(vocabulary) {
      return [VOCABULARY_TYPES.KEYWORD, VOCABULARY_TYPES.STRING].indexOf(vocabularyType(vocabulary)) > -1 && vocabulary.terms;
    }

    function isMatchVocabulary(vocabulary) {
      return vocabularyType(vocabulary) === VOCABULARY_TYPES.STRING && !vocabulary.terms;
    }

    function isNumericVocabulary(vocabulary) {
      return !vocabulary.terms && (vocabularyType(vocabulary) === VOCABULARY_TYPES.INTEGER || vocabularyType(vocabulary) === VOCABULARY_TYPES.DECIMAL);
    }

    function isRangeVocabulary(vocabulary) {
      return vocabulary.terms && (vocabularyType(vocabulary) === VOCABULARY_TYPES.INTEGER || vocabularyType(vocabulary) === VOCABULARY_TYPES.DECIMAL);
    }

    function isFacettedVocabulary(vocabulary) {
      return 'true' === vocabularyAttributeValue(vocabulary, 'facet', 'false');
    }

    function sortFilteredVocabularyTerms(vocabulary, terms, locale) {
      var termsSortKey = vocabularyTermsSortKey(vocabulary);
      if (termsSortKey && terms && terms.length > 0) {
        switch (termsSortKey) {
          case 'name':
            terms.sort(function (a, b) {
              return a[termsSortKey].localeCompare(b[termsSortKey]);
            });
            break;
          case 'title':
            terms.sort(function (a, b) {
              var titleA = LocalizedValues.forLocale(a[termsSortKey], locale);
              var titleB = LocalizedValues.forLocale(b[termsSortKey], locale);
              return titleA.localeCompare(titleB);
            });
            break;
        }
      }
    }

    function sortVocabularyTerms(vocabulary, locale) {
      sortFilteredVocabularyTerms(vocabulary, vocabulary.terms, locale ? locale : $translate.$use());
    }

    this.filter = filter;
    this.isVisibleVocabulary = isVocabularyVisible;
    this.findVocabularyAttributes = findVocabularyAttributes;
    this.visibleVocabularies = visibleVocabularies;
    this.visibleFacetVocabularies = visibleFacetVocabularies;
    this.isRangeVocabulary = isRangeVocabulary;
    this.isTermsVocabulary = isTermsVocabulary;
    this.isMatchVocabulary = isMatchVocabulary;
    this.isNumericVocabulary = isNumericVocabulary;
    this.isFacettedVocabulary = isFacettedVocabulary;
    this.sortVocabularyTerms = sortVocabularyTerms;
    this.sortFilteredVocabularyTerms = sortFilteredVocabularyTerms;
    this.vocabularyAlias = vocabularyAlias;
    this.vocabularyField = vocabularyField;

    return this;
  }

  ngObibaMica.search.service('VocabularyService',
    ['$translate', 'LocalizedValues', 'MetaTaxonomyService', VocabularyService]);

})();