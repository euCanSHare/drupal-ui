/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file
 * JsScript to deal with the switch links lang widget
 */

(function ($) {

  Drupal.behaviors.hrefLanWrapper = {
    attach: function (context, settings) {

      if (document === context) {
        function updateLinkLang(){
          var redirectPath = Drupal.settings.hrefLanWrapper.path;
          $('a.fragment-link-place-holder').each(function (i,link) {
            var urlParts = location.href.split(redirectPath);
            var newLink = $(link).attr('href').split('#')[0] + (urlParts[1] || '');
            $(link).attr('href', newLink);
          });
        }
        updateLinkLang();
        window.onhashchange = function(){
          updateLinkLang();
        }
        
      }
    }
  };

})(jQuery);
