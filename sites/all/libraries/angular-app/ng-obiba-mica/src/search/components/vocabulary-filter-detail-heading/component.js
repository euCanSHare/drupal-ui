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

  function VocabularyFilterDetailHeading() {
    var ctrl = this;
    var bodyElement = document.querySelectorAll('body')[0];

    function selectType(type) {
      return ctrl.onSelectType({ type: type });
    }

    function closePanelWhenClickingOutside(event, callbackOnClose) {
      var keepOpen = event.target.closest('#back-to-top') !== null;
      var nodes = bodyElement.querySelectorAll('.overlay-front-on-box-shodow');

      function isInside(rect) {
        return event.clientX > rect.x && event.clientX < rect.x + rect.width &&
          event.clientY > rect.y && event.clientY < rect.y + rect.height;
      }

      nodes.forEach(function (node) {
        keepOpen = keepOpen || isInside(node.getBoundingClientRect());
      });

      if (nodes && !keepOpen) {
        event.preventDefault();
        if (callbackOnClose) {
          callbackOnClose();
        }
      }
    }

    function removeWindowEventHandlers() {
      bodyElement.onkeyup = null;
      bodyElement.onmouseup = null;
    }

    function addWindowEventHandlers() {
      bodyElement.onmouseup = function (event) {
        closePanelWhenClickingOutside(event, ctrl.togglePannel);
      };

      bodyElement.onkeyup = function (event) {
        if (event.keyCode === 27) {
          removeWindowEventHandlers();
          ctrl.togglePannel();
        }
      };
    }

    function onFilterChange(queryString) {
      return ctrl.onFilterChange({ queryString: queryString });
    }

    function onDestroy() {
      removeWindowEventHandlers();
    }

    ctrl.selectType = selectType;
    ctrl.filterChange = onFilterChange;
    ctrl.$onDestroy = onDestroy;

    addWindowEventHandlers();
  }

  ngObibaMica.search
    .component('vocabularyFilterDetailHeading', {
      transclude: true,
      bindings: {
        showTaxonomyPanel: '<',
        taxonomyName: '<',
        taxonomiesQuery: '<',
        clearQuery: '<',
        onFilterChange: '&',
        taxonomyTypeMap: '<',
        resultTabsOrder: '<',
        target: '<',
        onSelectType: '&',
        result: '<',
        togglePannel: '&'
      },
      templateUrl: ['ngObibaMicaSearchTemplateUrl', function (ngObibaMicaSearchTemplateUrl) {
        return ngObibaMicaSearchTemplateUrl.getTemplateUrl('vocabularyFilterDetailHeading');
      }],
      controller: [VocabularyFilterDetailHeading]
    });
})();
