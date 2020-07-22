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
  Drupal.behaviors.micaNetwork_networks_datatable_init = {

    attach: function (context, settings) {
      if (context === document) {
        $('#table-networks').dataTable(
          {
            "bAutoWidth": false,
            "responsive": true,
            "data": settings.table_network_networks_data || [],
            "columns": settings.table_network_networks_headers || [],
            "iDisplayLength": 25,
            "scrollCollapse": true,
            "sDom": '<"table-var-wrapper" <<"md-top-margin pull-left" i><"pull-right" f>><"clear-fix" ><"no-float-tab" r<"scroll-content-tab" t>><"clear-fix" ><"pull-left md-top-margin" l><"pull-right md-top-margin" p>>',
            "language": {
              "url": Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/datatable-international'
            },
            "fnDrawCallback": function (oSettings) {
              if (oSettings._iDisplayLength > oSettings.aoData.length) {
                $('#table-networks_paginate').hide();
                $('#table-networks_length').hide();
              } else {
                $('#table-networks_paginate').show();
                $('#table-networks_length').show();
              }
            }
          }
        );
      }
    }
  }

}(jQuery));
