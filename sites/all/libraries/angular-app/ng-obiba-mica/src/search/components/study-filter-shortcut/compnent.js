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

  function StudyFilterShortcut($location, $translate, RqlQueryService, StudyFilterShortcutService) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'search/components/study-filter-shortcut/component.html',
      link: function (scope) {
        scope.studyFilterSelection = {
          get selection() {
            return this._selection;
          },
          set selection(value) {
            this._selection = value;
            updateStudyClassNameFilter(value);
          }
        };

        function updateStudyClassNameFilter(choice) {
          StudyFilterShortcutService.filter(choice, $translate.use());
        }

        function setChoice() {
          var result = StudyFilterShortcutService.getStudyClassNameChoices();
          if (result.choseAll) {
            scope.studyFilterSelection._selection = ngObibaMica.search.STUDY_FILTER_CHOICES.ALL_STUDIES;
          } else if (result.choseIndividual) {
            scope.studyFilterSelection._selection = ngObibaMica.search.STUDY_FILTER_CHOICES.INDIVIDUAL_STUDIES;
          } else if (result.choseHarmonization) {
            scope.studyFilterSelection._selection = ngObibaMica.search.STUDY_FILTER_CHOICES.HARMONIZATION_STUDIES;
          }
        }

        scope.$on('$locationChangeSuccess', function () {
          setChoice();
        });

        setChoice();
      }
    };
  }

  ngObibaMica.search.directive('studyFilterShortcut',
    [
      '$location',
      '$translate',
      'RqlQueryService',
      'StudyFilterShortcutService',
      StudyFilterShortcut
    ]
  );
})();
