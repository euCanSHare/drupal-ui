'use strict';

ngObibaMica.search
  .filter('visibleVocabularies', ['VocabularyService', function (VocabularyService) {
    return function (vocabularies) {
      return VocabularyService.visibleVocabularies(vocabularies);
    };
  }]);