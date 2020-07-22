/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

mica.ObibaAnalysis = angular.module('mica.ObibaAnalysis', [
    'obiba.mica.analysis'
  ])
  .config(['ngObibaMicaAnalysisTemplateUrlProvider',
    function (ngObibaMicaAnalysisTemplateUrlProvider) {
      ngObibaMicaAnalysisTemplateUrlProvider.setHeaderUrl('entities', Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_analysis_entities_count-view-header');
    }]);
