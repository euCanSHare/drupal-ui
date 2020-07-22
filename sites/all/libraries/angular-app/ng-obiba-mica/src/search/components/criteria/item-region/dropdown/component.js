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

/* global CRITERIA_ITEM_EVENT */
/* global QUERY_GROWL_EVENT */

(function () {

  /**
   * State shared between Criterion DropDown and its content directives
   *
   * @constructor
   */
  function CriterionState() {
    var onOpenCallbacks = [];
    var onCloseCallbacks = [];

    this.dirty = false;
    this.open = false;
    this.loading = true;

    this.addOnOpen = function (callback) {
      onOpenCallbacks.push(callback);
    };

    this.addOnClose = function (callback) {
      onCloseCallbacks.push(callback);
    };

    this.onOpen = function () {
      onOpenCallbacks.forEach(function (callback) {
        callback();
      });
    };

    this.onClose = function () {
      onCloseCallbacks.forEach(function (callback) {
        callback();
      });
    };
  }

  function CriterionDropdownController($scope, $filter, LocalizedValues, VocabularyService, StringUtils) {
    var closeDropdown = function () {
      if (!$scope.state.open) {
        return;
      }

      $scope.state.onClose();

      var wasDirty = $scope.state.dirty;
      $scope.state.open = false;
      $scope.state.dirty = false;
      if (wasDirty) {
        $scope.$emit(QUERY_GROWL_EVENT, $scope.criterion.vocabulary.title, $scope.criterion.lang, $scope.criterion.target);
        // trigger a query update
        $scope.$emit(CRITERIA_ITEM_EVENT.refresh);
      }
    };

    var openDropdown = function () {
      if ($scope.state.open) {
        closeDropdown();
        return;
      }

      $scope.state.open = true;
      $scope.state.onOpen();
    };

    var remove = function () {
      $scope.$emit(CRITERIA_ITEM_EVENT.deleted, $scope.criterion);
    };

    var onKeyup = function (event) {
      if (event.keyCode === 13) {
        closeDropdown();
      }
    };

    $scope.state = new CriterionState();
    $scope.timestamp = new Date().getTime();
    $scope.localize = function (values) {
      return LocalizedValues.forLocale(values, $scope.criterion.lang);
    };

    $scope.localizeCriterion = function () {
      var rqlQuery = $scope.criterion.rqlQuery;

      if ((rqlQuery.name === RQL_NODE.IN ||
          rqlQuery.name === RQL_NODE.OUT ||
          rqlQuery.name === RQL_NODE.CONTAINS) &&
          $scope.criterion.selectedTerms &&
          $scope.criterion.selectedTerms.length > 0) {

        var sep = rqlQuery.name === RQL_NODE.IN ? ' | ' : ' ';
        var prefix = rqlQuery.name === RQL_NODE.OUT ? '-' : '';
        return $scope.criterion.selectedTerms.map(function (t) {
          if (!$scope.criterion.vocabulary.terms) {
            return t;
          }
          var found = $scope.criterion.vocabulary.terms.filter(function (arg) {
            return arg.name === t;
          }).pop();
          return prefix + (found ? LocalizedValues.forLocale(found.title, $scope.criterion.lang) : t);
        }).join(sep);
      }
      var operation = rqlQuery.name;
      switch (rqlQuery.name) {
        case RQL_NODE.EXISTS:
          operation = ':' + $filter('translate')('any');
          break;
        case RQL_NODE.MISSING:
          operation = ':' + $filter('translate')('none');
          break;
        case RQL_NODE.EQ:
          operation = '=' + rqlQuery.args[1];
          break;
        case RQL_NODE.GE:
          operation = '>' + rqlQuery.args[1];
          break;
        case RQL_NODE.LE:
          operation = '<' + rqlQuery.args[1];
          break;
        case RQL_NODE.BETWEEN:
          operation = ':[' + rqlQuery.args[1] + ']';
          break;
        case RQL_NODE.IN:
        case RQL_NODE.CONTAINS:
          operation = '';
          break;
        case RQL_NODE.MATCH:
          operation = ':match(' + rqlQuery.args[0] + ')';
          break;
      }
      return LocalizedValues.forLocale($scope.criterion.vocabulary.title, $scope.criterion.lang) + operation;
    };

    $scope.vocabularyType = VocabularyService.vocabularyType;
    $scope.onKeyup = onKeyup;
    $scope.truncate = StringUtils.truncate;
    $scope.remove = remove;
    $scope.openDropdown = openDropdown;
    $scope.closeDropdown = closeDropdown;
    $scope.VocabularyService = VocabularyService;
  }

  function CriterionDropdown($document, $timeout, ngObibaMicaSearchTemplateUrl) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        criterion: '=',
        query: '='
      },
      controller: [
        '$scope',
        '$filter',
        'LocalizedValues',
        'VocabularyService',
        'StringUtils',
        CriterionDropdownController],
      templateUrl: ngObibaMicaSearchTemplateUrl.getTemplateUrl('CriterionDropdownTemplate'),
      link: function ($scope, $element) {
        var onDocumentClick = function (event) {
          var isChild = document.querySelector('#' + $scope.criterion.id.replace('.', '-') + '-dropdown-' + $scope.timestamp)
            .contains(event.target);

          if (!isChild) {
            $timeout(function () {
              $scope.$apply('closeDropdown()');
            });
          }
        };

        $document.on('click', onDocumentClick);
        $element.on('$destroy', function () {
          $document.off('click', onDocumentClick);
        });
      }
    };
  }

  /**
   * This directive serves as the container for each time of criterion based on a vocabulary type.
   * Specialize contents types as directives and share the state with this container.
   */
  ngObibaMica.search.directive('criterionDropdown',
    ['$document', '$timeout', 'ngObibaMicaSearchTemplateUrl', CriterionDropdown]);
})();