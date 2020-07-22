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
  function NumericVocabularyFilterDetailController() {
    var ctrl = this;

    function setRangeValue(submitEvent) {
      var from = submitEvent.target[0].value;
      var to = submitEvent.target[1].value;
      var args = {};

      if (from) {
        args.from = parseInt(from, 10);
      }

      if (to) {
        args.to = parseInt(to, 10);
      }

      ctrl.onSelectArgs({ vocabulary: ctrl.vocabulary, args: args });
    }

    ctrl.setRangeValue = setRangeValue;
  }

  ngObibaMica.search
    .component('numericVocabularyFilterDetail', {
      transclude: true,
      bindings: {
        vocabulary: '<',
        onSelectArgs: '&'
      },
      templateUrl: 'search/components/criteria/numeric-vocabulary-filter-detail/component.html',
      controller: [NumericVocabularyFilterDetailController]
    });
})();
