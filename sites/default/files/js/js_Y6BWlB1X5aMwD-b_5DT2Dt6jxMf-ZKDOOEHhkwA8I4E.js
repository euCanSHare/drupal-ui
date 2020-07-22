(function ($) {

  Drupal.Collapsiblock = Drupal.Collapsiblock || {};

  Drupal.behaviors.collapsiblock = {

    attach: function (context, settings) {
      var cookieData = Drupal.Collapsiblock.getCookieData();
      var slidetype = settings.collapsiblock.slide_type;
      var activePages = settings.collapsiblock.active_pages;
      var slidespeed = parseInt(settings.collapsiblock.slide_speed, 10);
      $('.collapsiblock').once('collapsiblock', function () {
        var id = this.id.split("-").pop();
        var titleElt = $(this)[0];
        if (titleElt.children.length > 0) {
          // Status values: 1 = not collapsible, 2 = collapsible and expanded,
          // 3 = collapsible and collapsed, 4 = always collapsed,
          // 5 = always expanded
          var stat = $(this).data('collapsiblock-action');
          if (stat == 1) {
            return;
          }

          titleElt.target = $(this).siblings().not($('.contextual-links-wrapper'));
          $(titleElt)
          .wrapInner('<a href="#collapse-' + id + '" role="link" />')
          .click(function (e) {
            if ($(this).is('.collapsiblockCollapsed')) {
              $(this).removeClass('collapsiblockCollapsed');
              if (slidetype == 1) {
                $(this.target).slideDown(slidespeed).attr('aria-hidden', false);
              }
              else {
                $(this.target).animate({
                  height: 'show',
                  opacity: 'show'
                }, slidespeed);
              }

              // Don't save cookie data if the block is always collapsed.
              if (stat != 4 && stat != 5) {
                cookieData[id] = 1;
              }
            }
            else {
              $(this).addClass('collapsiblockCollapsed');
              if (slidetype == 1) {
                $(this.target).slideUp(slidespeed).attr('aria-hidden', true);
              }
              else {
                $(this.target).animate({
                  height: 'hide',
                  opacity: 'hide'
                }, slidespeed);
              }

              // Don't save cookie data if the block is always collapsed.
              if (stat != 4 && stat != 5) {
                cookieData[id] = 0;
              }
            }
            // Stringify the object in JSON format for saving in the cookie.
            cookieString = JSON.stringify(cookieData);
            $.cookie('collapsiblock', cookieString, {
              path: settings.basePath
            });
          });
          // Leave active blocks if Remember collapsed on active pages is false.
          // If the block is expanded, do nothing.
          if (stat == 4 || (cookieData[id] == 0 || (stat == 3 && cookieData[id] == undefined))) {
            if (!$(this).find('a.active').size() || activePages === 1) {
              // Allow block content to assign class 'collapsiblock-force-open'
              // to it's content to force itself to stay open. E.g. useful if
              // block contains a form that was just ajaxly updated and should
              // be visible
              if (titleElt.target.hasClass('collapsiblock-force-open') || titleElt.target.find('.collapsiblock-force-open').size() > 0) {
                return;
              }
              $(titleElt).addClass('collapsiblockCollapsed');
              $(titleElt.target).hide();
            }
          }
        }
      });
    }

  };

  Drupal.Collapsiblock.getCookieData = function () {
    if ($.cookie) {
      var cookieString = $.cookie('collapsiblock');
      return cookieString ? $.parseJSON(cookieString) : {};
    }
    else {
      return '';
    }
  };


})(jQuery);
;
/**
 * @file
 * JavaScript ajax helper for Statistics variables retrieving.
 */

(function ($) {
  Drupal.behaviors.obiba_agate_utilities = {
    attach: function (context, settings) {
      var pathName = Drupal.settings.currentPath;
      var hashAttribute = location.href.split('#')[1];
      function destinationLinkDeal(){
        var currentLocation = location.href;
        var urlDestination = currentLocation.split('?destination=')[1];
        if(!urlDestination){
          urlDestination = pathName + '#' + currentLocation.split('#')[1];
        }
        if (hashAttribute) {
          $('form#user-login').each(function () {
            var action = this.getAttribute('action');
            var positionDestination = action.indexOf('?destination=');
            if (positionDestination > 0) {
              var  basePath = action.substring(0, positionDestination != -1 ? positionDestination : action.length);
              action = basePath + '?destination=' + urlDestination;
              $(this).attr('action', action);
            }
          });
          $('a.redirection-place-holder').each(function () {
            var href = this.getAttribute('href');
            var positionDestination = href.indexOf('?destination=');
            if (positionDestination > 0) {

             var  basePath = href.substring(0, positionDestination != -1 ? positionDestination : href.length);
              href = basePath + '?destination=' + urlDestination;
              $(this).attr('href', href);
            }
          });
        }
      }
      destinationLinkDeal();
      window.onhashchange = function(){
        destinationLinkDeal();
      }
    }
  }
}(jQuery));
;
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
  var hasAjax = false;
  var ready = false;
  $.ObibaProgressBarController = (function() {
    var bar = new $.ObibaProgressBar();

    return {
      start: bar.start,
      pause: bar.pause,
      inc: bar.inc,
      update: bar.update,
      finish: bar.finish,
      setPercentage: bar.set
    };
  });

  $(document).ready(function () {
    if (!hasAjax){
      $.ObibaProgressBarController().finish();
    }
    ready = true;
  });

  $(document).ajaxStart(function () {
    hasAjax = true;
    if (ready){
      $.ObibaProgressBarController().start();
    }
  });

  $(document).ajaxSend(function () {
  });

  $(document).ajaxComplete(function () {
    $.ObibaProgressBarController().inc(5);
  });

  $(document).ajaxStop(function () {
    hasAjax = false;
    $.ObibaProgressBarController().finish();
  });

})(jQuery);
;
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
  $(document).ready(function() {
    $("div.main-container ol.breadcrumb").addClass( 'hidden-print' );
    $('div.main-container h1.page-header').addClass( 'hidden-print' );
    $('div.alert').addClass( 'hidden-print' );
    $('footer').addClass( 'hidden-print' );
  });
}(jQuery));
;
