/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function ($) {
  Drupal.behaviors.obiba_scroll_up_widget = {
    attach: function (context, settings) {

      if (context != document) {
        return;
      }

      var theScrollUp = document.createElement('a');
      theScrollUp.setAttribute('href', "#");
      theScrollUp.setAttribute('id', "back-to-top");
      theScrollUp.setAttribute('title', Drupal.t('Back to top'));
      theScrollUp.setAttribute('class', "btn btn-default btn-xs");

      var icone = document.createElement('i');
      icone.setAttribute('class', "glyphicon glyphicon-chevron-up");

      theScrollUp.appendChild(icone);

      document.getElementsByClassName("region region-content")[0].appendChild(theScrollUp);
      if ($('#back-to-top').length) {

        var scrollTrigger = 100, // px
            backToTop = function () {
              var scrollTop = $(window).scrollTop();
              if (scrollTop > scrollTrigger) {
                $('#back-to-top').addClass('show');
              } else {
                $('#back-to-top').removeClass('show');
              }
            };
        backToTop();
        $(window).on('scroll', function () {
          backToTop();
        });
        $('#back-to-top').on('click', function (e) {
          e.preventDefault();
          $('html,body').animate({
            scrollTop: 0
          }, 700);
        });
      }

    }
  }
}(jQuery));