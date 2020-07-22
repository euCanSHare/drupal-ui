/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

/* exported DISPLAY_TYPES */
var DISPLAY_TYPES = {
  LIST: 'list',
  COVERAGE: 'coverage',
  GRAPHICS: 'graphics'
};

ngObibaMica.search = angular.module('obiba.mica.search', [
  'obiba.alert',
  'ui.bootstrap',
  'pascalprecht.translate',
  'ngclipboard',
  'templates-ngObibaMica',
  'obiba.mica.sets'
]);

(function () {
  ngObibaMica.search
    .run(['GraphicChartsConfigurations',
      function (GraphicChartsConfigurations) {
        GraphicChartsConfigurations.setClientConfig();
      }]);
})();
