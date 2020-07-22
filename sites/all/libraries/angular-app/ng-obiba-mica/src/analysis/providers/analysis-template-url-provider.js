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

/* global NgObibaMicaTemplateUrlFactory */

(function () {
  ngObibaMica.analysis
    .config(['$provide', function ($provide) {
      $provide.provider('ngObibaMicaAnalysisTemplateUrl', new NgObibaMicaTemplateUrlFactory().create(
        {
          entities: { header: null, footer: null },
            variableCrosstab: { template: null },
            variableFrequencies: { template: null },
            variableFrequenciesEmpty: { template: null },
            variableStatistics: { template: null },
            variableStatisticsEmpty: { template: null },
        }
      ));
    }]);
})();

