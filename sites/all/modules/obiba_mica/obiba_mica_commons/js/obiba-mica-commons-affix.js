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
 * JsScript to deal for FixSidebar widget
 */

(function ($) {
  $(document).ready(function () {
    $('body').attr('data-spy', 'scroll').attr('data-target', '#scroll-menu').attr('data-offset', '150');
  });
}(jQuery));
