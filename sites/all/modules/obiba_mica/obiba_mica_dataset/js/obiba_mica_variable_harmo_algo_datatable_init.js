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
  Drupal.behaviors.micaDataset_variable_harmo_algo_datable_init = {

    attach: function (context, settings) {

      if (context === document) {
        var TitleButtonVar = $('#harmo-algo').attr('title-button-var');
        $('#harmo-algo').on('click', function () {
          var idHarmonizationVariable = $(this).attr('var-id');
          var sectionContainer = $('div#harmo-algo');
          $(this).text(Drupal.t('Hide') + ' ' + TitleButtonVar);
          var $btn = $(this).button('loading');
          $('.collapse').collapse();
          $.ajax({
            'url': Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/variables-harmonization-algo/' + idHarmonizationVariable + '/' + JSON.stringify(getSortedVariableNames()),
            'type': 'GET',
            'dataType': 'html',
            'data': '',
            'success': function (data) {
              try {
                var data_decoded = jQuery.parseJSON(data);
                if (!data_decoded.algo) {
                  $('#harmo-algo-empty').removeClass('hidden');
                } else {
                  $('#harmo-algo-empty').addClass('hidden');

                  sectionContainer.append(data_decoded['algo']);
                }
              } catch (e) {
                console.error('micaDataset_variable_harmo_algo_datable_init', e);
              }
            },
            'error': function (data) {
              console.log('Some errors....');
            }
          });

          // WORKAROUND: When the harmonization table is a child, the DataTable is not drawn properly
          Drupal.behaviors.micaDataset_variable_harmo_datatable_init.invalidate(context, $('#harmo-algo'));

          $("#harmo-algo").unbind("click");
          $(this).removeAttr('id');
          $(this).attr('id', 'harmo-algo-toggle');

          $btn.button('reset')
        });
        $('.collapse').on('hidden.bs.collapse', function () {

          $('#harmo-algo-toggle').text(Drupal.t('Show') + ' ' + TitleButtonVar);
        });
        $('.collapse').on('shown.bs.collapse', function () {

          $('#harmo-algo-toggle').text(Drupal.t('Hide') + ' ' + TitleButtonVar);
        });

        function getSortedVariableNames() {
          var table = $('#table-variable-harmonization').DataTable();
          var variableNames = {};
          $.each(table.rows().data(), function (i, cell) {
            variableNames[cell[cell.length - 1]] = null;
          });

          return variableNames;
        }
      }
    }
  }
}(jQuery));
