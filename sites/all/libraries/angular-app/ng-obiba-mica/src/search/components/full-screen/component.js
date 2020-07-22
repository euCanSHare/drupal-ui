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

  function FullScreen(FullScreenService) {
    return {
      link : function ($scope, $element, $attrs) {
        if ($attrs.fullscreen) {
          $scope.$watch($attrs.fullscreen, function(value) {
            var isEnabled = FullScreenService.isEnabled();
            if (value && !isEnabled) {
              FullScreenService.enable($element[0]);
              $element.addClass('isInFullScreen');
            } else if (!value && isEnabled) {
              FullScreenService.cancel();
              $element.removeClass('isInFullScreen');
            }
          });
        }
      }
    };
  }

  ngObibaMica.search.directive('fullscreen', ['FullScreenService',FullScreen]);
})();
