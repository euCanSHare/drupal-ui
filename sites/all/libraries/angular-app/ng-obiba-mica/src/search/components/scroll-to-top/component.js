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
  function ScrollToTop() {
    return {
      restrict: 'A',
      scope: {
        trigger: '=scrollToTop'
      },
      link: function postLink(scope, elem) {
        scope.$watch('trigger', function () {
          elem[0].scrollTop = 0;
        });
      }
    };
  }

  function TableScroll($timeout, $rootScope) {
    return {
      restrict: 'C',
      scope: {},
      link: function(scope, elem) {
        var timeoutPromise = null;
        var fullscreenElement = document.querySelector('.can-full-screen');
        var windowFirstChild = document.querySelector('body .navbar-fixed-top');
        var thead = elem.find('table > thead');
        var theadTop = null;
        var saveTheadTop = null;
        var initialTheadBackgroundColor = elem.find('table > thead').css('background-color');
        var opaqueTheadBackground = rgbaToRgb(initialTheadBackgroundColor);

        function updateTHeadTop() {
          timeoutPromise = $timeout(function (){
            theadTop = getElementRectangle(thead[0]).top;
          });
        }

        function rgbaToRgb(color) {
          var rgbaRegex = /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+),?[\s+]?(\S+)\)$/i;
          var matches = color.match(rgbaRegex);

          if (matches && matches.length >= 4) {
            var r = parseInt(matches[1], 10);
            var g = parseInt(matches[2], 10);
            var b = parseInt(matches[3], 10);
            var a = parseFloat(matches[4] || '1', 10);

            var rPrime = (1 - a) * 255 + a * r;
            var gPrime = (1 - a) * 255 + a * g;
            var bPrime = (1 - a) * 255 + a * b;

            return 'rgb(' + rPrime + ', ' + gPrime + ', ' + bPrime + ')';
          }

          return color;
        }

        function getWindowScroll() {
          return {
            top: window.pageYOffset,
            left: window.pageXOffset
          };
        }

        function getElementRectangle(item) {
          var rectangle = item.getBoundingClientRect();
          var windowScroll = getWindowScroll();

          return {
            left: rectangle.left + windowScroll.left,
            top: rectangle.top + windowScroll.top,
            width: rectangle.width,
            height: rectangle.height
          };
        }

        function onScrollFullscreen() {
          if (fullscreenElement.scrollTop > theadTop) {
            thead.css('transform', 'translateY('+(fullscreenElement.scrollTop - theadTop) + 'px)');
            thead.css('background-color', opaqueTheadBackground);
          } else {
            thead.css('transform', 'translateY(0)');
            thead.css('background-color', initialTheadBackgroundColor);
          }
        }

        function onFullscreenChanged(obj, isFullscreen) {
          if (isFullscreen) {
            fullscreenElement.scrollTo(0, 0);
            saveTheadTop = theadTop;
            updateTHeadTop();
            window.removeEventListener('scroll', onScroll);
            fullscreenElement.addEventListener('scroll', onScrollFullscreen);
          } else {
            theadTop = saveTheadTop;
            saveTheadTop = null;
            fullscreenElement.removeEventListener('scroll', onScrollFullscreen);
            window.addEventListener('scroll', onScroll);
            onScroll();
          }
        }

        function onScroll() {
          theadTop = theadTop|| getElementRectangle(thead[0]).top;
          var bodyFirstItemHeight = windowFirstChild ? windowFirstChild.getBoundingClientRect().height : 0;
          var itemTop = theadTop + bodyFirstItemHeight;

          if (window.scrollY > itemTop) {
            thead.css('transform', 'translateY(' + Math.max(0, window.scrollY + bodyFirstItemHeight - theadTop) + 'px)');
            thead.css('background-color', opaqueTheadBackground);
          } else {
            thead.css('transform', 'translateY(0)');
            thead.css('background-color', initialTheadBackgroundColor);
          }
        }

        function onDestroy() {
          $timeout.cancel(timeoutPromise);
          window.removeEventListener('scroll', onScroll);
          fullscreenElement.removeEventListener('scroll', onScrollFullscreen);
        }

        $rootScope.$on('ngObibaMicaSearch.fullscreenChange', onFullscreenChanged);
        scope.$on('ngObibaMicaLeftPaneToggle', updateTHeadTop);
        scope.$on('$destroy', onDestroy);
        window.addEventListener('scroll', onScroll);
        updateTHeadTop();
      }
    };
  }

  function InfiniteScroll($timeout) {
    return {
      restrict: 'C',
      scope: {
        load: '&'
      },
      link: function(scope, element) {
        function scroll () {
          var rawEle = element[0];

          if (window.scrollY >= (0.8 * rawEle.offsetHeight)) {
            $timeout(function () {
              scope.load();
            });
          }
        }

        window.document.addEventListener('scroll', scroll);

        scope.$on('$destroy', function () {
          window.document.removeEventListener('scroll', scroll);
        });
      }
    };
  }

  ngObibaMica.search.directive('scrollToTop', ScrollToTop);
  ngObibaMica.search.directive('tableScroll', ['$timeout', '$rootScope', TableScroll]);
  ngObibaMica.search.directive('infiniteScroll', ['$timeout', InfiniteScroll]);

})();
