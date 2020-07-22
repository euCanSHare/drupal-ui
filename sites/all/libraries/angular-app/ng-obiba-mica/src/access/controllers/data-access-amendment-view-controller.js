'use strict';

(function () {
  function Controller($scope,
                      $rootScope,
                      $routeParams,
                      $q,
                      $uibModal,
                      DataAccessEntityResource,
                      DataAccessEntityService,
                      DataAccessEntityFormService,
                      DataAccessAmendmentFormConfigResource,
                      DataAccessEntityUrls,
                      AlertService,
                      ngObibaMicaAccessTemplateUrl,
                      UserProfileService) {

    $rootScope.$on('$translateChangeSuccess', function () {
      DataAccessAmendmentFormConfigResource.get().$promise.then(function (value) {
        $scope.dataAccessForm = value;
      });
    });

    $scope.userProfile = function (profile) {
      $scope.applicant = profile;
      $uibModal.open({
        scope: $scope,
        templateUrl: 'access/views/data-access-request-profile-user-modal.html'
      });
    };

    function getFullName(profile) {
      return UserProfileService.getFullName(profile);
    }

    function getProfileEmail(profile) {
      return UserProfileService.getEmail(profile);
    }

    function getDataContent(data) {
      return data.content ? JSON.parse(data.content) : {};
    }

    function resetRequestEntity() {
      var entity = DataAccessEntityResource.get($scope.entityUrl, $routeParams.id);
      $q.all([entity, entity.$promise.then(getDataContent)])
        .then(function (values) {
          $scope.requestEntity = values[0];
          $scope.model = values[1];
        });
    }

    $scope.entityUrl = DataAccessEntityUrls.getDataAccessAmendmentUrl($routeParams.parentId, $routeParams.id);
    $scope.read = true;
    $scope.formDrawn = false;

    var amendment = DataAccessEntityResource.get($scope.entityUrl, $routeParams.id);
    var model = amendment.$promise.then(getDataContent);
    var dataAccessForm = DataAccessAmendmentFormConfigResource.get();

    $q.all([amendment, model, dataAccessForm.$promise]).then(function (values) {
      $scope.requestEntity = values[0];
      $scope.model = values[1];
      $scope.dataAccessForm = values[2];

      $scope.actions = DataAccessEntityService.actions;
      $scope.nextStatus = DataAccessEntityService.nextStatus;

      Object.assign($scope, DataAccessEntityFormService.for($scope, $scope.requestEntity, resetRequestEntity));

      return values;
    }, function (reason) {
      console.error('Failed to resolve amendment promises because', reason);
    });

    $scope.headerTemplateUrl = ngObibaMicaAccessTemplateUrl.getHeaderUrl('amendmentView');
    $scope.footerTemplateUrl = ngObibaMicaAccessTemplateUrl.getFooterUrl('amendmentView');

    $scope.submit = function () {
      $scope.$broadcast('schemaFormValidate');
      if ($scope.forms.requestForm.$valid) {
        DataAccessEntityResource.updateStatus($scope.entityUrl, $routeParams.id, DataAccessEntityService.status.SUBMITTED).$promise
          .then(function () {
            $uibModal.open({
              scope: $scope,
              templateUrl: 'access/views/data-access-request-submitted-modal.html'
            }).result.then(function () {
              resetRequestEntity();
            });
          });
      } else {
        AlertService.alert({
          id: 'DataAccessAmendmentViewController',
          type: 'danger',
          msgKey: 'data-access-request.submit.invalid'
        });
      }
    };

    $scope.toggleFormDrawnStatus = function (value) {
      $scope.formDrawn = value;
    };

    $scope.getFullName = getFullName;
    $scope.getProfileEmail = getProfileEmail;
  }

  angular.module('obiba.mica.access').controller('DataAccessAmendmentViewController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q' ,
    '$uibModal',
    'DataAccessEntityResource',
    'DataAccessEntityService',
    'DataAccessEntityFormService',
    'DataAccessAmendmentFormConfigResource',
    'DataAccessEntityUrls',
    'AlertService',
    'ngObibaMicaAccessTemplateUrl',
    'UserProfileService',
    Controller
  ]);
})();