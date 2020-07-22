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
 * JsScript to initialise dataTables widgets
 */

(function ($) {
  Drupal.behaviors.micaDataset_Datatable_detail = {
    attach: function (context, settings) {

      $('.dce-actions').each(function () {
        $(this).show();
      });


    }
  }
}(jQuery));