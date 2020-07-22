'use strict';

/**
   * Base controller for taxonomies and classification panels.
   *
   * @param $scope
   * @param $location
   * @param TaxonomyResource
   * @param TaxonomiesResource
   * @param ngObibaMicaSearch
   * @constructor
   */
  /* exported BaseTaxonomiesController */
  function BaseTaxonomiesController($rootScope,
    $scope,
    $translate,
    $location,
    TaxonomyResource,
    TaxonomiesResource,
    ngObibaMicaSearch,
    RqlQueryUtils,
    $cacheFactory,
    VocabularyService) {

    $scope.options = ngObibaMicaSearch.getOptions();
    $scope.RqlQueryUtils = RqlQueryUtils;
    $scope.metaTaxonomy = TaxonomyResource.get({
      target: 'taxonomy',
      taxonomy: 'Mica_taxonomy'
    });

    $scope.taxonomies = {
      all: [],
      search: {
        text: null,
        active: false
      },
      target: $scope.target || 'variable',
      taxonomy: null,
      vocabulary: null
    };

    $rootScope.$on('$translateChangeSuccess', function () {
      if ($scope.taxonomies && $scope.taxonomies.vocabulary) {
        VocabularyService.sortVocabularyTerms($scope.taxonomies.vocabulary, $translate.use());
      }
    });

    // vocabulary (or term) will appear in navigation iff it doesn't have the 'showNavigate' attribute
    $scope.canNavigate = function (vocabulary) {
      if ($scope.options.hideNavigate.indexOf(vocabulary.name) > -1) {
        return false;
      }

      return (vocabulary.attributes || []).filter(function (attr) { return attr.key === 'showNavigate'; }).length === 0;
    };

    this.navigateTaxonomy = function (taxonomy, vocabulary, term) {
      $scope.taxonomies.term = term;

      if ($scope.isHistoryEnabled) {
        var search = $location.search();
        search.taxonomy = taxonomy ? taxonomy.name : null;

        if (vocabulary && search.vocabulary !== vocabulary.name) {
          VocabularyService.sortVocabularyTerms(vocabulary, $scope.lang);
          search.vocabulary = vocabulary.name;
        } else {
          search.vocabulary = null;
        }

        $location.search(search);
      } else {
        $scope.taxonomies.taxonomy = taxonomy;

        if (!$scope.taxonomies.vocabulary || $scope.taxonomies.vocabulary.name !== vocabulary.name) {
          VocabularyService.sortVocabularyTerms(vocabulary, $scope.lang);
        }

        $scope.taxonomies.vocabulary = vocabulary;
      }
    };

    this.updateStateFromLocation = function () {
      var search = $location.search();
      var taxonomyName = search.taxonomy,
        vocabularyName = search.vocabulary, taxonomy = null, vocabulary = null;

      if (!$scope.taxonomies.all) { //page loading
        return;
      }

      $scope.taxonomies.all.forEach(function (t) {
        if (t.name === taxonomyName) {
          taxonomy = t;
          t.vocabularies.forEach(function (v) {
            if (v.name === vocabularyName) {
              vocabulary = v;
            }
          });
        }
      });

      if (!angular.equals($scope.taxonomies.taxonomy, taxonomy) || !angular.equals($scope.taxonomies.vocabulary, vocabulary)) {
        $scope.taxonomies.taxonomy = taxonomy;

        if (vocabulary) {
          VocabularyService.sortVocabularyTerms(vocabulary, $scope.lang);
        }

        $scope.taxonomies.vocabulary = vocabulary;
      }
    };

    this.selectTerm = function (target, taxonomy, vocabulary, args) {
      $scope.onSelectTerm(target, taxonomy, vocabulary, args);
    };

    this.clearCache = function () {
      var taxonomyResourceCache = $cacheFactory.get('taxonomyResource');
      if (taxonomyResourceCache) {
        taxonomyResourceCache.removeAll();
      }
    };

    var self = this;

    $scope.$on('$locationChangeSuccess', function () {
      if ($scope.isHistoryEnabled) {
        self.updateStateFromLocation();
      }
    });
    $scope.$watch('taxonomies.vocabulary', function (value) {
      if (RqlQueryUtils && value) {
        $scope.taxonomies.isNumericVocabulary = VocabularyService.isNumericVocabulary($scope.taxonomies.vocabulary);
        $scope.taxonomies.isMatchVocabulary = VocabularyService.isMatchVocabulary($scope.taxonomies.vocabulary);
      } else {
        $scope.taxonomies.isNumericVocabulary = null;
        $scope.taxonomies.isMatchVocabulary = null;
      }
    });

    $scope.navigateTaxonomy = this.navigateTaxonomy;
    $scope.selectTerm = this.selectTerm;
    $scope.clearCache = this.clearCache;
  }