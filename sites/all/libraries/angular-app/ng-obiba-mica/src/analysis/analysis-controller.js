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

(function() {

  function manageEntitiesCountHelpText($scope, $translate, $cookies) {
    var cookiesHelp = 'micaHideEntitiesCountHelpText';
    
    $translate(['analysis.entities-count.help'])
      .then(function (translation) {
        if (!$scope.options.EntitiesCountHelpText && !$cookies.get(cookiesHelp)) {
          $scope.options.EntitiesCountHelpText = translation['analysis.entities-count.help'];
        }
      });

    // Close the cart help box and set the local cookies
    $scope.closeHelpBox = function () {
      $cookies.put(cookiesHelp, true);
      $scope.options.EntitiesCountHelpText = null;
    };

    // Retrieve from local cookies if user has disabled the cart help box and hide the box if true
    if ($cookies.get(cookiesHelp)) {
      $scope.options.EntitiesCountHelpText = null;
    }

  }

  ngObibaMica.analysis
  .controller('EntitiesCountController', [
    '$scope',
    '$location',
    '$translate',
    '$cookies',
    'LocalizedValues',
    'AnalysisConfigService',
    'EntitiesCountResource',
    'AlertService',
    'ServerErrorUtils',
    'ngObibaMicaAnalysisTemplateUrl',
    function($scope, $location, $translate, $cookies, LocalizedValues, AnalysisConfigService, EntitiesCountResource, AlertService, ServerErrorUtils, ngObibaMicaAnalysisTemplateUrl) {
      $scope.options = AnalysisConfigService.getOptions();
      manageEntitiesCountHelpText($scope, $translate, $cookies);
      $scope.entitiesHeaderTemplateUrl = ngObibaMicaAnalysisTemplateUrl.getHeaderUrl('entities');
      $scope.result = {};
      $scope.query = $location.search().query;
      $scope.loading = false;
  
      function refresh() {
        if ($scope.query) {
          $scope.loading = true;
  
          EntitiesCountResource.get({ query: $scope.query },
            function onSuccess(response) {
              $scope.result = response;
              $scope.loading = false;
              $scope.localizedTotal = ($scope.result.belowPrivacyThreshold ? '<' : '') + LocalizedValues.formatNumber($scope.result.total, $translate.use());
            },
            function onError(response) {
              $scope.result = {};
              $scope.loading = false;
              AlertService.alert({
                id: 'EntitiesCountController',
                type: 'danger',
                msg: ServerErrorUtils.buildMessage(response),
                delay: 5000
              });
            });
        } else {
          $scope.result = {};
        }
      }
  
      refresh();
  
      $scope.$on('$locationChangeSuccess', function() {
        $scope.query = $location.search().query;
        refresh();
      });
  
    }]); 
})();
