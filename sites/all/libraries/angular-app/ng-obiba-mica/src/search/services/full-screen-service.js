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

  function FullScreenService($document, $window, $rootScope) {
    // based on: https://github.com/fabiobiondi/angular-fullscreen
    var document = $document[0];
    var emitter = $rootScope.$new();


    var serviceInstance = {
      $on: angular.bind(emitter, emitter.$on),
      enable: function (element) {
        if (element.requestFullScreen) {
          element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      },
      cancel: function () {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      },
      isEnabled: function () {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        return fullscreenElement ? true : false;
      }
    };

    $document.on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function () {
      emitter.$emit('ngObibaMicaSearch.fullscreenChange', serviceInstance.isEnabled());
    });

    return serviceInstance;
  }

  ngObibaMica.search.factory('FullScreenService', ['$document', '$window', '$rootScope', FullScreenService]);
})();
