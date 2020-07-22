/*
 * Copyright (c) 2016 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';


mica.AnalysisVariableCrosstab = angular.module('mica.AnalysisVariableCrosstab', [
  'obiba.mica.DatasetVariableCrosstab'
]).run(['AnalysisConfigService', function(AnalysisConfigService){
  AnalysisConfigService.setOptions({
    crosstab: {
      showDetailedStats: Drupal.settings.angularjsApp.show_detailed_stats
    }
  })
}]);
