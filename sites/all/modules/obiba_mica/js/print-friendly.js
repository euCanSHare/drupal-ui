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
  $(document).ready(function() {
    $("div.main-container ol.breadcrumb").addClass( 'hidden-print' );
    $('div.main-container h1.page-header').addClass( 'hidden-print' );
    $('div.alert').addClass( 'hidden-print' );
    $('footer').addClass( 'hidden-print' );
  });
}(jQuery));
