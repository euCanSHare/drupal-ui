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
  Drupal.behaviors.micaDataset_studies_datatable_init = {

    attach: function (context, settings) {
      if (settings.collection_studies_table_data && settings.collection_studies_table_headers) {
        renderTable('table-studies', settings.collection_studies_table_data, settings.collection_studies_table_headers);
      }
      if (settings.harmonization_studies_table_data && settings.harmonization_studies_table_headers) {
        renderTable('table-harmonization-studies', settings.harmonization_studies_table_data, settings.harmonization_studies_table_headers);
      }
      function hidePaginationLength(element){
        $('#' + element + '_paginate').hide();
        $('#' + element + '_length').hide();
      }
      function showPaginationLength(element){
        $('#' + element + '_paginate').show();
        $('#' + element + '_length').show();
      }
      function renderTable(divTable, data, header) {
        $('#' + divTable).dataTable(
          {
            "bAutoWidth": false,
            "responsive": true,
            "data": data,
            "columns": header,
            "iDisplayLength": 25,
            "scrollCollapse": true,
            "sDom": '<"table-var-wrapper" <<"md-top-margin pull-left" i><"pull-right" f>><"clear-fix" ><"no-float-tab" r<"scroll-content-tab" t>><"clear-fix" ><"pull-left md-top-margin" l><"pull-right md-top-margin" p>>',
            "language": {
              "url": Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/datatable-international'
            },
            "fnDrawCallback": function (oSettings) {
              if (oSettings._iDisplayLength > oSettings.aoData.length) {
                hidePaginationLength(divTable);
              } else {
                showPaginationLength(divTable);
              }
            }
          }
        );
      }
    }
  }

}(jQuery));
