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
 * JsScript ajax helper for Search widget : in dataset, network, study list
 */

(function ($) {
  Drupal.behaviors.obiba_translatable_path = {
    attach: function (context, settings) {
      /*******************/
      if (Drupal.settings.obiba_mica) {
        var disabledPathTranslation = window.location.pathname.replace(Drupal.settings.basePath, '').replace(Drupal.settings.obiba_mica.currentLang, '');
        var redirectionUrl = window.location.href.replace(Drupal.settings.obiba_mica.currentLang, '');
//check if current path must be not translated and not the same of current address url (to prevent loop redirection)
        if ($.inArray(disabledPathTranslation, Drupal.settings.obiba_mica.paths) > -1 && redirectionUrl != window.location.href) {
          var warning = "Veuillez noter que les pages d'inscription et de demande d'accès ne sont disponibles qu'en anglais seulement. La traduction française sera disponible sous peu.";
          $('.main-container').empty();
          $('body').append('<div id="myModal" class="modal fade"> <div class="modal-dialog"> <div class="modal-content"><div class="modal-header"><h4 class="modal-title">Attention</h4> </div><div class="modal-body">' + warning + '</div> <!-- dialog buttons --> <div class="modal-footer"><button id="ok" type="button" class="btn btn-primary">OK</button></div> </div> </div> </div>');
          $('#myModal').modal({
            "backdrop"  : "static",
            "keyboard"  : true,
            "show"      : true
          });

          setTimeout(function() {
            // wait to make sure DOM has been updated
            $('#myModal button#ok').on('click', function(e) {
              $('#myModal').modal('hide');
              $('#myModal button#ok').off('click');
              // redirect to the EN page
              window.location.href = window.location.href.replace(Drupal.settings.obiba_mica.currentLang, '');
            });
          }, 500);

        }
      }

    }
  }
})(jQuery);
