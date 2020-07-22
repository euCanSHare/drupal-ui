'use strict';

(function () {
  function Service($rootScope, $filter, $location, DataAccessEntityUrls, DataAccessEntityResource, DataAccessEntityService, NOTIFICATION_EVENTS) {

    this.for = function (scope, accessEntity, successCallback, errorCallback) {
      var self = {};
      var parentId = accessEntity['obiba.mica.DataAccessAmendmentDto.amendment'].parentId;
      var entityRootpath = parentId ? DataAccessEntityUrls.getDataAccessAmendmentUrl(parentId, accessEntity.id) :
        DataAccessEntityUrls.getDataAccessRequestUrl(accessEntity.id);

      var prefix = parentId ? 'data-access-amendment' : 'data-access-request';

      function confirmStatusChange(status, messageKey, statusName) {
        $rootScope.$broadcast(
          NOTIFICATION_EVENTS.showConfirmDialog,
          {
            titleKey: prefix + '.status-change-confirmation.title',
            messageKey: messageKey !== null ? messageKey : prefix + '.status-change-confirmation.message',
            messageArgs: statusName !== null ? [$filter('translate')(statusName).toLowerCase()] : []
          }, status);
      }

      function statusChangedConfirmed(status, expectedStatus) {
        if (status === expectedStatus) {
          DataAccessEntityResource.updateStatus(entityRootpath, accessEntity.id, status).$promise.then(successCallback, errorCallback);
        }
      }

      function onDeleteConfirmed(event, id) {
        if (accessEntity.id === id) {
          DataAccessEntityResource.delete(entityRootpath, id).$promise.then(
            function () {
              $location.path(parentId ? '/data-access-request/' + parentId : '/data-access-requests').replace();
            });
        }
      }

      self.reopen = function () {
        confirmStatusChange(DataAccessEntityService.status.OPENED, null, 'reopen');
      };

      self.review = function () {
        confirmStatusChange(DataAccessEntityService.status.REVIEWED, prefix + '.status-change-confirmation.message-review', null);
      };

      self.approve = function () {
        confirmStatusChange(DataAccessEntityService.status.APPROVED, null, 'approve');
      };

      self.reject = function () {
        confirmStatusChange(DataAccessEntityService.status.REJECTED, null, 'reject');
      };

      self.conditionallyApprove = function () {
        confirmStatusChange(DataAccessEntityService.status.CONDITIONALLY_APPROVED, null, 'conditionallyApprove');
      };

      self.delete = function () {
        $rootScope.$broadcast(NOTIFICATION_EVENTS.showConfirmDialog,
          {
            titleKey: prefix + '.delete-dialog.title',
            messageKey: prefix + '.delete-dialog.message',
            messageArgs: [accessEntity.title, accessEntity.applicant]
          }, accessEntity.id
        );
      };

      self.printForm = function () {
        setTimeout(function () { window.print(); }, 250);
      };

      scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onDeleteConfirmed);

      scope.$on(
        NOTIFICATION_EVENTS.confirmDialogAccepted,
        function (event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.OPENED, status);
        }
      );

      scope.$on(
        NOTIFICATION_EVENTS.confirmDialogAccepted,
        function (event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.REVIEWED, status);
        }
      );

      scope.$on(
        NOTIFICATION_EVENTS.confirmDialogAccepted,
        function (event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.CONDITIONALLY_APPROVED, status);
        }
      );

      scope.$on(
        NOTIFICATION_EVENTS.confirmDialogAccepted,
        function (event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.APPROVED, status);
        }
      );

      scope.$on(
        NOTIFICATION_EVENTS.confirmDialogAccepted,
        function (event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.REJECTED, status);
        }
      );

      return self;
    };
  }

  angular.module('obiba.mica.access').service('DataAccessEntityFormService', ['$rootScope', '$filter', '$location', 'DataAccessEntityUrls', 'DataAccessEntityResource', 'DataAccessEntityService', 'NOTIFICATION_EVENTS', Service]);
})();