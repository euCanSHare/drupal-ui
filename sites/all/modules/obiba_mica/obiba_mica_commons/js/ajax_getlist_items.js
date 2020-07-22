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
  Drupal.behaviors.datatables_add_head = {
    attach: function (context, settings) {
      // To prevent Drupal from defaulting form button type to 'submit'
      $("#refresh-button").prop('type', 'button');

      if (Drupal.settings.context) {
        $("#edit-search-query").on("keyup", function (e) {
          e.preventDefault();
          var that = this;

          function doSearch(){
            var url = Drupal.settings.basePath + 'mica/' + Drupal.settings.context.url + '/' + $(that).val() + '/' +
                $("#edit-search-sort").val() + '/' + $("#edit-search-sort-order").val() + '/0';

            if (Drupal.settings.document_type) {
              url += '?document_type=' + Drupal.settings.document_type;
            }

            $.ajax({
              url: url,
              done: function (data) {
                if (data) {
                  $('#refresh-list').empty().append(data.list);
                  $('#refresh-count').empty().append(data.total === null ? 0 : data.total);
                  var data_url = $('#obiba-mica-search-form').serialize();
                  window.location = window.location.origin + Drupal.settings.context.currentCleanPath + data_url;
                }
              }
            });
          }

          if (e.keyCode == 13) {
            e.preventDefault();
            doSearch();
          }
        });
      }

      $("#edit-search-sort-order").on("change", function () {
        var data_url = $('#obiba-mica-search-form').serialize();
        window.location =  window.location.origin + Drupal.settings.context.currentCleanPath + data_url;
      });

      $("#edit-search-sort").on("change", function () {
        var data_url = $('#obiba-mica-search-form').serialize();
        window.location =  window.location.origin + Drupal.settings.context.currentCleanPath + data_url;
      });

      $("#refresh-button").on("click", function () {
        event.preventDefault();
        window.location = window.location.origin + Drupal.settings.context.currentCleanPath;
      });
    }
  }
})(jQuery);
