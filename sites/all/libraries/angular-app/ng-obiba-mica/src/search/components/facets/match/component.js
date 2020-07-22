'use strict';

/* global CriteriaIdGenerator */

ngObibaMica.search
  .controller('MatchVocabularyFacetController', ['$scope', 'RqlQueryService', function ($scope, RqlQueryService) {
    function updateMatch(criteria, vocabulary) {
      var criterion = RqlQueryService.findCriterion(criteria, CriteriaIdGenerator.generate($scope.$parent.taxonomy, vocabulary));
      if (criterion && criterion.rqlQuery && criterion.rqlQuery.args[1]) {
        $scope.text = criterion.rqlQuery.args[0];
      } else {
        $scope.text = null;
      }
    }

    function updateCriteria() {
      $scope.$parent.selectTerm($scope.$parent.target, $scope.$parent.taxonomy, $scope.vocabulary, { text: $scope.text || '*' });
    }

    $scope.onKeypress = function (ev) {
      if (ev.keyCode === 13 || ev.type === 'click') {
        updateCriteria();
      }
    };

    $scope.$on('ngObibaMicaQueryUpdated', function (ev, criteria) {
      if ($scope.vocabulary.isMatch && $scope.vocabulary.isOpen) {
        updateMatch(criteria, $scope.vocabulary);
      }
    });

    $scope.$on('ngObibaMicaLoadVocabulary', function (ev, taxonomy, vocabulary) {
      if (vocabulary.name === $scope.vocabulary.name && !vocabulary.isOpen) {
        updateMatch($scope.criteria, vocabulary);
      }
    });
  }]);