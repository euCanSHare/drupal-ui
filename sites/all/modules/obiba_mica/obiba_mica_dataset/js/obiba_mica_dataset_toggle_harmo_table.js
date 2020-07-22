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
 * JavaScript ajax helper for Algorithm variables retrieving
 */

(function ($) {
  Drupal.behaviors.obiba_mica_dataset_toggle_harmo_table = {

    attach: function (context, settings) {

      if (context === document) {
        var TitleButtonVar = $('#harmo-table-btn').attr('title-button-var');
        $('#harmo-table-btn').on('click', function () {

          $(this).text(Drupal.t('Hide') + ' ' + TitleButtonVar);
          $('.collapse').collapse();

          // WORKAROUND: When the harmonization table is a child, the DataTable is not drawn properly.
          Drupal.behaviors.micaDataset_Datatable_init.invalidate(context, $('#harmo-table'));

          $("#harmo-table-btn").unbind("click");
          $(this).removeAttr('id');
          $(this).attr('id', 'harmo-table-toggle');
        });
        $('.collapse').on('hidden.bs.collapse', function () {

          $('#harmo-table-toggle').text(Drupal.t('Show') + ' ' + TitleButtonVar);
        });
        $('.collapse').on('shown.bs.collapse', function () {

          $('#harmo-table-toggle').text(Drupal.t('Hide') + ' ' + TitleButtonVar);
        });
      }
    }
  }
}(jQuery));
