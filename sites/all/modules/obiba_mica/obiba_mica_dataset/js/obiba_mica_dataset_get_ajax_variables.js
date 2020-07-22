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
 * JavaScript ajax helper for Statistics variables retrieving
 */

(function ($) {

  Drupal.behaviors.obiba_mica_variable = {
    attach: function (context, settings) {
      if (context === document) {
        getAjaxTable();
      }

      function getAjaxTable() {
        var alertMEssage = '<div class="alert alert-warning alert-dismissible" role="alert">' +
          '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span>' +
          '<span class="sr-only">Close</span></button> ' + Drupal.t('Unable to retrieve statistics...') + '</div>';

        var message_div_stat_tab = $('#toempty');
        var param_stat_tab = $('#param-statistics');

        var var_id = param_stat_tab.attr('var-id');
        if (var_id) {
          $.ajax({
            'url': Drupal.settings.basePath + Drupal.settings.pathPrefix + 'variable-detail-statistics/' + var_id,
            'type': 'GET',
            'dataType': 'html',
            'data': '',
            'success': function (data) {
              try {
                var data_decoded = jQuery.parseJSON(data);
              } catch (e) {
                console.log(e.message);
              }

              if (typeof data_decoded == 'object') {
                //   console.log(data_decoded);
              }
              if (! data_decoded) {
                param_stat_tab.empty();

                $(alertMEssage).appendTo(param_stat_tab);
              }
              else {
                if (data_decoded.table) {
                  message_div_stat_tab.empty();
                  param_stat_tab.css({'padding-top': '0'});
                  $(data_decoded.table).appendTo(param_stat_tab);
                }
                else {
                  message_div_stat_chart.empty();
                }

                Drupal.attachBehaviors(param_stat_tab, settings);
              }
            },
            'error': function (data) {
              param_stat_tab.empty();
              var $errorMessage = Drupal.t('Error!');
              console.log($errorMessage);
              $($errorMessage).appendTo(param_stat_tab);
            }
          });
        }
        else{
          $('section#section-statistics').remove();
        }
      }
    }
  };

}(jQuery));
