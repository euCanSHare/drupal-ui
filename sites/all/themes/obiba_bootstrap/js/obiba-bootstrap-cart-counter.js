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

  Drupal.behaviors.progress_bar = {
    attach: function (context, settings) {
      var agateUser = settings.angularjsApp
        && settings.angularjsApp.authenticated
        && settings.angularjsApp.agate_user;

      var username =  agateUser ? settings.angularjsApp.user.name : 'anonymous';

      var updateCartCounter = function () {
        var total = ['variables', 'datasets', 'studies', 'networks']
          .map(function (type) {
            return (JSON.parse(localStorage.getItem('mica.cart.' + type)) || {})[username];
          })
          .filter(function (set) {
            return set;
          })
          .map(function (set) {
            return set.count;
          })
          .reduce(function (a, b) {
            return a + b;
          }, 0);
        $('#mica-cart-counter').text(total || 0);
      };

      // tabs and windows will be notified, EXCEPT the one that originated the event...
      $(window).bind('storage', function (e) {
        if (e.originalEvent.key === 'mica.cart.variables') {
          updateCartCounter();
        }
      });

      $(document).bind('cart-updated', function (e) {
        updateCartCounter();
      });

      $(document).ready(function () {
        updateCartCounter();
      });
    }
  };

})(jQuery);
