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

  ngObibaMica.search.SortVocabularyTerms = function(VocabularyService) {
    return function (terms, vocabulary) {
      VocabularyService.sortFilteredVocabularyTerms(vocabulary, terms);
      return terms;
    };
  };

  ngObibaMica.search.filter('sortTerms', ['VocabularyService', ngObibaMica.search.SortVocabularyTerms]);

})();

