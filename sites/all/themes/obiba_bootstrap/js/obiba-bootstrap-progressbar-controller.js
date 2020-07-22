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

  Drupal.behaviors.progress_bar = {
    attach: function (context, settings) {
      if (document === context) {
        var top = $('#toolbar').length > 0 ?  $('#toolbar').height() : 0;
        var backgroundColor = '#09afa0';
        var radius = '25px';
        $.ObibaProgressBarController().update({
          barCssOverride: {background: backgroundColor, top: top},
          spinnerCssOverride: {
            'top': top + 18,
            iconCssOverride:{
              'border-top-color': backgroundColor,
              'border-left-color': backgroundColor,
              'width': radius,
              'height': radius
            }
          }
        });
      }
    }
  };

})(jQuery);
