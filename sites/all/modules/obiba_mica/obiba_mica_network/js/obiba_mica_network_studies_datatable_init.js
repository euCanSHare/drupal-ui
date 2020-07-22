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
  Drupal.behaviors.micaNetwork_studies_datatable_init = {

    attach: function (context, settings) {
      if (context === document) {
        if(settings.individual_study_table_data){
          buildTable('#table-individual-studies', settings.individual_study_table_data, settings.individual_study_table_headers);
        }
        else{
        $("#individual-studies-table").remove();
        }
        if(settings.harmonization_study_table_data) {
          buildTable('#table-harmo-studies', settings.harmonization_study_table_data, settings.harmonization_study_table_headers);
        }
        else{
          $("#harmonization-studies-table").remove()
        }
        function buildTable(idTable, data, header){
          $(idTable).dataTable(
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
                   $(idTable + '_paginate').hide();
                   $(idTable + '_length').hide();
                } else {
                  $(idTable + '_paginate').show();
                  $(idTable + '_length').show();
                }
              }
            }
          );
        }
      }
    }
  }

}(jQuery));
