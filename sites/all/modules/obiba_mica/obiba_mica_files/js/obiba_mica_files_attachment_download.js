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
 * JsScript to deal with  attachment files
 */

(function ($) {
  Drupal.behaviors.attachement_download = {
    attach: function (context, settings) {
      $('a#download-attachment').each(function () {
        $(this).on('click', function (event) {
          // create a form for the file upload
          var entityType = $(this).attr('entity');
          var idEntity = $(this).attr('id_entity');
          var fileName = $(this).attr('file_name');
          var filepath = $(this).attr('file_path');
          var form = $("<form action='" + Drupal.settings.basePath + 'download/' + idEntity + '/' + entityType + '/' + fileName + "' method='post'><input name='file_path' type='hidden' value='" + filepath + "'>");
          $(this).after(form);
          form.submit().remove();
          return false;
        });

      });

    }
  }
})(jQuery);
