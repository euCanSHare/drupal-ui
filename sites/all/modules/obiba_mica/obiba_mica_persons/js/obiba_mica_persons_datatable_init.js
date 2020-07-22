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
 * JsScript dataTable initialization of associated persons
 */

(function ($) {
  Drupal.behaviors.micaPersons_Datatable_init = {
    attach: function (context, settings) {
      if (context === document) {
        $('#associated-people').on('show.bs.modal', function (event) {
          createDataTable(Drupal.settings.headerTable, Drupal.settings.entitiesId);
        });
      }
    }
  };

  function createDataTable(headerTable, entitiesId) {
    var divTablePersons = $('#person-table');
    if ($.fn.dataTable.isDataTable('#person-table')) {
      divTablePersons.dataTable();
    }
    else {
      divTablePersons.dataTable({
        "bAutoWidth": false,
        "responsive": true,
        "sDom": '<"table-var-wrapper"r<"pull-left"f><"#buttonPlaceholder.pull-right"><"scroll-content-tab" t>p>',
        "bServerSide": false,
        "iDisplayLength": 10,
        "sAjaxSource": Drupal.settings.basePath + Drupal.settings.pathPrefix + Drupal.settings.resourcePathPersons + encodeURIComponent(JSON.stringify(entitiesId)) + '/ws',
        "aoColumns": headerTable,
        "bSearchable": false,
        "searching": true,
        "paging": true,
        "columnDefs": [
          {
            targets: 0,
            render: function (data, type, row) {
              var title = row.title ? row.title : '';
              return title + ' ' + (row.firstName ? row.firstName : '') + ' ' + row.lastName;
            }
          },
          {
            targets: 1,
            render: function (data, type, row) {
              return row.email ? row.email : '';
            }
          },
          {
            targets: 2,
            render: function (row, data, type, meta) {
              var studies = '';
              var acronymCurrentLang;
              if (row) {
                $.each(row, function (study, studyObj) {
                  if (studyObj) {
                    if(studyObj.parentAcronym){
                      $.each(studyObj.parentAcronym, function (index, acronym) {
                        if (acronym.lang == Drupal.settings.current_lang) {
                          acronymCurrentLang = acronym.value;
                          return false;
                        }
                      });
                    }
                    else{
                      acronymCurrentLang = studyObj.parentId;
                    }
                    studies += (studies != '' ? ', ' : '') + '<a href="' + Drupal.settings.basePath + 'mica/study/' + studyObj.parentId + '">' + acronymCurrentLang + '</a> (' + studyObj.role + ')';
                  }
                });
              }
              return studies;
            }
          },
          {
            targets: - 1,
            render: function (row, data, type, meta) {
              var networks = '';
              var acronymCurrentLang;
              if (row) {
                $.each(row, function (network, networkObj) {
                  if (networkObj) {
                    $.each(networkObj.parentAcronym, function (index, acronym) {
                      if (acronym.lang == Drupal.settings.current_lang) {
                        acronymCurrentLang = acronym.value;
                        return false;
                      }
                    });
                    networks += (networks != '' ? ', ' : '') + '<a href="' + Drupal.settings.basePath + 'mica/network/' + networkObj.parentId + '">' + acronymCurrentLang + '</a> (' + networkObj.role + ')';
                  }
                });
              }
              return networks;
            }
          }
        ],
        "ordering": false,
        "language": {
          "url": Drupal.settings.basePath + Drupal.settings.pathPrefix + 'mica/datatable-international'
        }
      });
    }

    divTablePersons.on('draw.dt', function () {
      $("div#buttonPlaceholder").html(Drupal.settings.download_button);
      $("button#download-csv-person").on('click', function (event) {
        // create a form for the file upload
        var form = $("<form action='" + Drupal.settings.basePath + Drupal.settings.pathPrefix + Drupal.settings.resourcePathPersons + encodeURIComponent(JSON.stringify(entitiesId)) + '/download/ws' + "' method='post'>");
        $(this).after(form);
        form.submit().remove();
        return false;
      });
    });

  }
}(jQuery));
