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
 * code to initialise Timeline
 */

(function ($) {
  var dceModalInfo;
  Drupal.behaviors.dce_detail_modal = {
    attach: function (context, settings) {
      dceModalInfo = settings.dceModalInfoArray;

      if (dceModalInfo) {
        $('#dce-modal').on('show.bs.modal', function (event) {
          var link = $(event.relatedTarget);
          var modal = $(this);
          seedModal(modal, link.data('dceid'));
        });
        $('#dce-modal').on('hide.bs.modal', function () {
          var modal = $(this);
          destroyModal(modal);
        });
        var urlHash = window.location.hash;
        if(urlHash.indexOf('dce-id-')>0){
          var UpPop = $("#dce-modal");
          seedModal(UpPop.modal(), urlHash.split('dce-id-')[1]);
        }
      }

      function seedModal(popup, dceId) {
        if(dceId){
        return Drupal.behaviors.dce_detail_modal.seedmodal(popup, dceId);
        }
      }

      function destroyModal(modal) {
        return Drupal.behaviors.dce_detail_modal.destroyModal(modal);
      }
    }
  };

  function getDceFromId(dceId) {
    var dce;
    for (var key in dceModalInfo) {
      dce = dceModalInfo[key].find(function (dce) {
        return dce.dce_uid === dceId;
      });
      if (dce) {
        return dce;
      }
    }
  }

  Drupal.behaviors.dce_detail_modal.destroyModal = function (popup) {
    popup.find('.dce-file-browser').hide();
    var fileBrowser = $(popup.find('.files-documents'));
    fileBrowser[0].firstElementChild.setAttribute('doc-path', '/');
    fileBrowser[0].firstElementChild.setAttribute('doc-id', '');
    fileBrowser[0].firstElementChild.setAttribute('token-key', '');
    fileBrowser[0].firstElementChild.setAttribute('refresh', false);
    fileBrowser[0].firstElementChild.classList.add('hide');
  };

  Drupal.behaviors.dce_detail_modal.seedmodal = function (popup, dceId) {
    var dce = getDceFromId(dceId);
    var popup = $(popup[0]);

    function seedSection(dataSection, contentSelector, section, contentType){
      if(dataSection){
        popup.find('.dce-' + section).show();
        dataSection.title ? popup.find('.' + section + '-title').text(dataSection.title): null;
        contentSelector ? popup.find(contentSelector).html(dataSection[contentType]): null;
      }
      else{
        popup.find('.dce-' + section).hide();
      }
    }

    if (dce) {
      popup.find('.dce-modal-title').text(dce['dce'].name);
      if (dce['dce'].description) {
        popup.find('.modal-dce-description').show();
        popup.find('.modal-dce-description').html(dce['dce'].description);
      }
      else {
        popup.find('.modal-dce-description').hide();
      }

      seedSection(dce['dce'].startYear, '.start-year', 'start-year', 'value');
      seedSection(dce['dce'].endYear, '.end-year', 'end-year', 'value');
      seedSection(dce['dce'].dataSources, '.data-sources-list', 'data-sources', 'list');
      seedSection(dce['dce'].administrativeDatabases, '.admin-databases-list', 'admin-databases', 'list');
      seedSection(dce['dce'].bioSamples, '.bio-samples-list', 'bio-samples', 'list');

      if (dce.file_browser) {
        popup.find('.dce-file-browser').show();
        var fileBrowser = $(popup.find('.files-documents'));
        fileBrowser[0].firstElementChild.classList.add('show');
        fileBrowser[0].firstElementChild.setAttribute('doc-path', dce.file_browser.marckup['doc_path']);
        fileBrowser[0].firstElementChild.setAttribute('doc-id', dce.file_browser.marckup['doc_id']);
        if(dce.file_browser.marckup['token_key']){
        fileBrowser[0].firstElementChild.setAttribute('token-key', dce.file_browser.marckup['token_key']);
        }
        fileBrowser[0].firstElementChild.setAttribute('refresh', true);
        fileBrowser[0].firstElementChild.setAttribute('show-title', true);
      }
      else {
        popup.find('.dce-file-browser').hide();
      }
    }
  };

})(jQuery);