'use strict';

(function () {
  function Controller($scope,
                      $rootScope,
                      $location,
                      $q,
                      $routeParams,
                      $uibModal,
                      DataAccessEntityResource,
                      DataAccessAmendmentFormConfigResource,
                      DataAccessEntityUrls,
                      DataAccessEntityService,
                      ServerErrorUtils,
                      AlertService,
                      DataAccessRequestDirtyStateService,
                      FormDirtyStateObserver,
                      SessionProxy,
                      ngObibaMicaAccessTemplateUrl) {

    function getDataContent(data) {
      return data.content ? JSON.parse(data.content) : {};
    }

    function onSuccess(response, headersFunction) {
      FormDirtyStateObserver.unobserve();
      var parts = headersFunction().location.split('/');
      $location.path($scope.entityUrl + '/amendment/' + parts[parts.length - 1]).replace();
    }

    function onError(response) {
      AlertService.alert({
        id: 'DataAccessAmendmentEditController',
        type: 'danger',
        msg: ServerErrorUtils.buildMessage(response)
      });
    }

    function destroyFormObserver() {
      FormDirtyStateObserver.unobserve();
      DataAccessRequestDirtyStateService.setForm(null);
    }

    $scope.entityUrl = $routeParams.id ? DataAccessEntityUrls.getDataAccessAmendmentUrl($routeParams.parentId, $routeParams.id) : DataAccessEntityUrls.getDataAccessRequestUrl($routeParams.parentId);
    $scope.read = false;
    $scope.formDrawn = false;

    $rootScope.$on('$translateChangeSuccess', function () {
      DataAccessAmendmentFormConfigResource.get().$promise.then(function (value) {
        $scope.dataAccessForm = value;
      });
    });

    var amendment = $routeParams.id ?
      DataAccessEntityResource.get($scope.entityUrl, $routeParams.id) :
      {
        'obiba.mica.DataAccessAmendmentDto.amendment': { parentId: $routeParams.parentId },
        $promise: new Promise(function (resolve) { setTimeout(resolve, 0, {}); }),
        status: DataAccessEntityService.status.OPENED
      };
    var model = amendment.$promise.then(getDataContent);
    var dataAccessForm = DataAccessAmendmentFormConfigResource.get();

    $q.all([amendment, model, dataAccessForm.$promise]).then(function (values) {
      $scope.requestEntity = values[0];
      $scope.model = values[1];
      $scope.dataAccessForm = values[2];

      return values;
    }, function (reason) {
      console.error('Failed to resolve amendment promises because', reason);
    });

    $scope.headerTemplateUrl = ngObibaMicaAccessTemplateUrl.getHeaderUrl('amendmentForm');
    $scope.footerTemplateUrl = ngObibaMicaAccessTemplateUrl.getFooterUrl('amendmentForm');

    FormDirtyStateObserver.observe($scope);

    DataAccessRequestDirtyStateService.setForm($scope.form);
    $scope.$on('$destroy', destroyFormObserver);

    $scope.cancel = function () {
      destroyFormObserver();
      $location.path($scope.entityUrl).replace();
    };

    $scope.save = function () {
      $scope.requestEntity.content = angular.toJson($scope.model || {});
      $scope.requestEntity.parentId = $routeParams.parentId;

      delete $scope.requestEntity.$promise;

      if (!$scope.requestEntity.applicant) {
        $scope.requestEntity.applicant= SessionProxy.login();
      }

      function doSaveOnGoingRequest() {
        DataAccessEntityResource.update($scope.entityUrl, $scope.requestEntity).$promise.then(function () {
          FormDirtyStateObserver.unobserve();
          $location.path($scope.entityUrl).replace();
        }, onError);
      }

      if (!$routeParams.id) {
        DataAccessEntityResource.create($scope.entityUrl, $scope.requestEntity, onSuccess, onError);
      } else {
        var isUnusual = ['OPENED', 'CONDITIONALLY_APPROVED'].indexOf($scope.requestEntity.status) === -1;

          if (isUnusual) {
            $scope.$broadcast('schemaFormValidate');
            if ($scope.forms.requestForm.$valid) {
              doSaveOnGoingRequest();
            } else {
              $scope.validate($scope.forms.requestForm);
            }
          } else {
            doSaveOnGoingRequest();
          }
      }
    };

    $scope.validate = function (form) {
      $scope.$broadcast('schemaFormValidate');
      $uibModal.open({
        resolve: {
          isValid: form.$valid
        },
        templateUrl: 'access/views/data-access-request-validation-modal.html',
        controller: ['$scope', 'isValid', function ($scope, isValid) {
          $scope.isValid = isValid;
        }]
      });
    };

    $scope.toggleFormDrawnStatus = function (value) {
      $scope.formDrawn = value;
    };
  }

  angular.module('obiba.mica.access')
    .controller('DataAccessAmendmentEditController', ['$scope',
      '$rootScope',
      '$location',
      '$q',
      '$routeParams',
      '$uibModal',
      'DataAccessEntityResource',
      'DataAccessAmendmentFormConfigResource',
      'DataAccessEntityUrls',
      'DataAccessEntityService',
      'ServerErrorUtils',
      'AlertService',
      'DataAccessRequestDirtyStateService',
      'FormDirtyStateObserver',
      'SessionProxy',
      'ngObibaMicaAccessTemplateUrl',
      Controller
    ]);
})();