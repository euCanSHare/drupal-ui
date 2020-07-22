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

ngObibaMica.access
  .controller('DataAccessRequestListController', [
    '$scope',
    'ngObibaMicaAccessTemplateUrl',

    function ($scope, ngObibaMicaAccessTemplateUrl) {
      $scope.headerTemplateUrl = ngObibaMicaAccessTemplateUrl.getHeaderUrl('list');
      $scope.footerTemplateUrl = ngObibaMicaAccessTemplateUrl.getFooterUrl('list');
    }])

  .controller('DataAccessRequestViewController',
    ['$rootScope',
      '$scope',
      '$q',
      '$location',
      '$uibModal',
      '$routeParams',
      '$filter',
      '$translate',
      'DataAccessRequestResource',
      'DataAccessAmendmentsResource',
      'DataAccessEntityService',
      'DataAccessRequestStatusResource',
      'DataAccessFormConfigResource',
      'DataAccessRequestAttachmentsUpdateResource',
      'DataAccessRequestCommentsResource',
      'DataAccessRequestCommentResource',
      'ngObibaMicaUrl',
      'ngObibaMicaAccessTemplateUrl',
      'AlertService',
      'ServerErrorUtils',
      'NOTIFICATION_EVENTS',
      'DataAccessRequestConfig',
      'SfOptionsService',
      'moment',
      'UserProfileService',

      function ($rootScope,
        $scope,
        $q,
        $location,
        $uibModal,
        $routeParams,
        $filter,
        $translate,
        DataAccessRequestResource,
        DataAccessAmendmentsResource,
        DataAccessEntityService,
        DataAccessRequestStatusResource,
        DataAccessFormConfigResource,
        DataAccessRequestAttachmentsUpdateResource,
        DataAccessRequestCommentsResource,
        DataAccessRequestCommentResource,
        ngObibaMicaUrl,
        ngObibaMicaAccessTemplateUrl,
        AlertService,
        ServerErrorUtils,
        NOTIFICATION_EVENTS,
        DataAccessRequestConfig,
        SfOptionsService,
        moment,
        UserProfileService) {


        var TAB_NAMES = Object.freeze({
          form: 0,
          amendments: 1,
          documents: 2,
          comments: 3,
          privateComments: 4,
          history: 5
        });

        function onError(response) {
          AlertService.alert({
            id: 'DataAccessRequestViewController',
            type: 'danger',
            msg: ServerErrorUtils.buildMessage(response)
          });
        }

        function onAttachmentError(attachment) {
          AlertService.alert({
            id: 'DataAccessRequestViewController',
            type: 'danger',
            msgKey: 'server.error.file.upload',
            msgArgs: [attachment.fileName]
          });
        }

        function retrieveComments() {
          DataAccessRequestCommentsResource.query({ id: $routeParams.id, admin: ($scope.privateComments === true) ? true : '' }, function (comments) {
            $scope.form.comments = comments || [];
          });
        }

        function selectTab(tab) {
          switch (tab) {
            case TAB_NAMES.form:
            case TAB_NAMES.history:
            case TAB_NAMES.documents:
              break;
            case TAB_NAMES.comments:
              $scope.privateComments = false;
              if ($scope.parentId === undefined) {
                retrieveComments();
              }
              break;
              case TAB_NAMES.privateComments:
              if ($scope.parentId === undefined) {
                $scope.privateComments = true;
                retrieveComments();
              }
              break;
            case TAB_NAMES.amendments:
              $scope.parentId = $routeParams.id;
              break;
          }
        }

        function submitComment(comment) {
          DataAccessRequestCommentsResource.save({ id: $routeParams.id, admin: $scope.privateComments === true}, comment.message, retrieveComments, onError);
        }

        function updateComment(comment) {
          DataAccessRequestCommentResource.update({ id: $routeParams.id, commentId: comment.id }, comment.message, retrieveComments, onError);
        }

        function deleteComment(comment) {
          $scope.commentToDelete = comment.id;

          $rootScope.$broadcast(NOTIFICATION_EVENTS.showConfirmDialog,
            {
              titleKey: 'comment.delete-dialog.title',
              messageKey: 'comment.delete-dialog.message',
              messageArgs: [comment.createdBy]
            }, comment.id
          );
        }

        function toggleAttachmentsForm(show) {
          if (show) {
            $scope.attachments = angular.copy($scope.dataAccessRequest.attachments) || [];
          }
          $scope.showAttachmentsForm = show;
        }

        function getRequest() {
          var resources = [DataAccessRequestResource.get];
          if ($scope.dataAccessForm.amendmentsEnabled) {
            resources.push(DataAccessAmendmentsResource.getLogHistory);
          }

          $q.all(resources.map(function(resource) {
            return resource.apply(null, [{ id: $routeParams.id }]).$promise;
          })).then(function (values) {
            var dataAccessRequest = values[0], amendmentsLogHistory = values[1];

            try {
              $scope.dataAccessRequest = dataAccessRequest;
              $scope.form.model = dataAccessRequest.content ? JSON.parse(dataAccessRequest.content) : {};
              var requestDownloadUrlPdf = ngObibaMicaUrl.getUrl('DataAccessRequestDownloadPdfResource').replace(':id', $scope.dataAccessRequest.id);
              $scope.requestDownloadUrl = requestDownloadUrlPdf + ((requestDownloadUrlPdf.indexOf('?q=') !== -1) ? '&' : '?') + 'lang=' + $translate.use();
              $scope.attachments = dataAccessRequest.attachments || [];
              $scope.lastSubmittedDate = findLastSubmittedDate();

              $scope.logsHistory =
              DataAccessEntityService.processLogsHistory(
                [].concat((dataAccessRequest.statusChangeHistory), (dataAccessRequest.actionLogHistory || []), (amendmentsLogHistory || []))
                  .sort(function(a, b) {
                    return a.changedOn.localeCompare(b.changedOn);
                  })
              );
            } catch (e) {
              $scope.validForm = false;
              $scope.form.model = {};
              AlertService.alert({
                id: 'DataAccessRequestViewController',
                type: 'danger',
                msgKey: 'data-access-request.parse-error'
              });
            }

            $scope.loading = false;
          }, onError);
        }

        function updateAttachments() {
          var request = angular.copy($scope.dataAccessRequest);
          request.attachments = $scope.attachments;
          DataAccessRequestAttachmentsUpdateResource.save(request, function () {
            toggleAttachmentsForm(false);
            getRequest();
          });
        }

        function initializeForm() {
          var deferred = $q.defer();
          $q.all([SfOptionsService.transform(), DataAccessFormConfigResource.get().$promise]).then(function (values){
            $scope.sfOptions = values[0];
            $scope.sfOptions.pristine = { errors: true, success: false };
            $scope.dataAccessForm = values[1];

            $scope.dataAccessForm.downloadTemplate = $scope.dataAccessForm.pdfDownloadType === 'Template';

            deferred.resolve();
          }, onError);

          return deferred.promise;
        }

        function findLastSubmittedDate() {
          var history = $scope.dataAccessRequest.logsHistory || [];
          return history.filter(function (item) {
            return item.to === DataAccessEntityService.status.SUBMITTED;
          }).sort(function (a, b) {
            if (moment(a).isBefore(b)) {
              return -1;
            }

            if (moment(a).isSame(b)) {
              return 0;
            }

            if (moment(a).isAfter(b)) {
              return 1;
            }
          }).pop();
        }

        function editStartDate() {

          function saveStartDate(startDate) {
            var yyyy = startDate.getFullYear();
            var mm = startDate.getMonth() + 1;
            var dd = startDate.getDate();
            var dateStr = yyyy + '-' + mm + '-' + dd;          
            $scope.dataAccessRequest.startDate = dateStr;
            DataAccessRequestResource.editStartDate({ id: $scope.dataAccessRequest.id, date: dateStr }, function () {
              getRequest();
            }, onError);
          }

          $uibModal.open({
            templateUrl: 'access/components/reports-progressbar/edit-start-date-modal.html',
            controller: ['$uibModalInstance', 'requestItem',
              function ($uibModalInstance, requestItem) {
                this.startDate = new Date(requestItem.reportsTimeline.startDate);
                this.endDate = new Date(requestItem.reportsTimeline.endDate);
                this.originalDate = this.startDate;
                this.valideDate = function() {
                  return this.startDate && this.startDate.getTime() < this.endDate.getTime();
                };
                this.close = function () {
                  if (this.originalDate !== this.startDate) {
                    saveStartDate(this.startDate);
                  }
                  $uibModalInstance.dismiss('close');
                };
              }],
            controllerAs: '$modal',
            size: 'sm',
            resolve: {
              requestItem: function () {
                return $scope.dataAccessRequest;
              }
            }
          });
        }

        function deleteEntity() {
          $scope.requestToDelete = $scope.dataAccessRequest.id;
          $rootScope.$broadcast(NOTIFICATION_EVENTS.showConfirmDialog,
            {
              titleKey: 'data-access-request.delete-dialog.title',
              messageKey: 'data-access-request.delete-dialog.message',
              messageArgs: [$scope.dataAccessRequest.title, $scope.dataAccessRequest.applicant]
            }, $scope.requestToDelete
          );
        }

        function getDownloadHref(attachment) {
          return ngObibaMicaUrl.getUrl('DataAccessRequestAttachmentDownloadResource')
            .replace(':id', $scope.dataAccessRequest.id).replace(':attachmentId', attachment.id);
        }

        function onDeleteConfirmed(event, id) {
          if ($scope.requestToDelete === id) {
            DataAccessRequestResource.delete({ id: $scope.requestToDelete },
              function () {
                $location.path('/data-access-requests').replace();
              });

            delete $scope.requestToDelete;
          }
        }

        function onUpdatStatusSuccess() {
          setTimeout(function () {
            getRequest();
          });
        }

        function confirmStatusChange(status, messageKey, statusName) {
          $rootScope.$broadcast(
            NOTIFICATION_EVENTS.showConfirmDialog,
            {
              titleKey: 'data-access-request.status-change-confirmation.title',
              messageKey: messageKey !== null ? messageKey : 'data-access-request.status-change-confirmation.message',
              messageArgs: statusName !== null ? [$filter('translate')(statusName).toLowerCase()] : []
            }, status);
        }

        function statusChangedConfirmed(status, expectedStatus) {
          if (status === expectedStatus) {
            DataAccessRequestStatusResource.update({
              id: $scope.dataAccessRequest.id,
              status: status
            }, onUpdatStatusSuccess, onError);
          }
        }

        function printForm() {
          // let angular digest!
          setTimeout(function () { window.print(); }, 250);
        }

        function submitForm() {
          $scope.$broadcast('schemaFormValidate');
          if ($scope.forms.requestForm.$valid) {
            DataAccessRequestStatusResource.update({
              id: $scope.dataAccessRequest.id,
              status: DataAccessEntityService.status.SUBMITTED
            }, function onSubmitted() {
              $uibModal.open({
                scope: $scope,
                templateUrl: 'access/views/data-access-request-submitted-modal.html'
              }).result.then(function () {
                onUpdatStatusSuccess();
              });
            }, onError);
          } else {
            AlertService.alert({
              id: 'DataAccessRequestViewController',
              type: 'danger',
              msgKey: 'data-access-request.submit.invalid'
            });
          }
        }

        function onDeleteCommentConfirmed(event, id) {
          if ($scope.commentToDelete === id) {
            DataAccessRequestCommentResource.delete({ id: $routeParams.id, commentId: id }, {}, retrieveComments, onError);
          }
        }

        function updateActionLogs(actionLogs) {
          if (Array.isArray(actionLogs)) {
            $scope.loading = true;
            $scope.dataAccessRequest.actionLogHistory = actionLogs;
            DataAccessRequestResource.editActionLogs($scope.dataAccessRequest, function () {
              onUpdatStatusSuccess();
            });
          }
        }

        function reOpen() {
          confirmStatusChange(DataAccessEntityService.status.OPENED, null, 'reopen');
        }

        function review() {
          confirmStatusChange(DataAccessEntityService.status.REVIEWED, 'data-access-request.status-change-confirmation.message-review', null);
        }

        function approve() {
          confirmStatusChange(DataAccessEntityService.status.APPROVED, null, 'approve');
        }

        function reject() {
          confirmStatusChange(DataAccessEntityService.status.REJECTED, null, 'reject');
        }

        function conditionallyApprove() {
          confirmStatusChange(DataAccessEntityService.status.CONDITIONALLY_APPROVED, null, 'conditionallyApprove');
        }

        function onStatusOpened(event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.OPENED, status);
        }

        function onStatusReviewed(event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.REVIEWED, status);
        }

        function onStatusConditionallyApproved(event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.CONDITIONALLY_APPROVED, status);
        }

        function onStatusApproved(event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.APPROVED, status);
        }

        function onStatusRejected(event, status) {
          statusChangedConfirmed(DataAccessEntityService.status.REJECTED, status);
        }

        function getFullName(profile) {
          return UserProfileService.getFullName(profile);
        }

        function getProfileEmail(profile) {
          return UserProfileService.getEmail(profile);
        }

        $scope.logsHistory = [];
        $scope.parentId = undefined;
        $scope.loading = false;
        $scope.validForm = true;
        $scope.config = DataAccessRequestConfig.getOptions();
        $scope.actions = DataAccessEntityService.actions;
        $scope.nextStatus = DataAccessEntityService.nextStatus;
        $scope.showAttachmentsForm = false;
        $scope.selectTab = selectTab;
        $scope.delete = deleteEntity;
        $scope.editStartDate = editStartDate;
        $scope.submitComment = submitComment;
        $scope.updateComment = updateComment;
        $scope.deleteComment = deleteComment;
        $scope.getDownloadHref = getDownloadHref;
        $scope.updateAttachments = updateAttachments;
        $scope.cancelAttachments = function () { toggleAttachmentsForm(false); };
        $scope.editAttachments = function () { toggleAttachmentsForm(true); };
        $scope.updateActionLogs = updateActionLogs;
        $scope.onAttachmentError = onAttachmentError;
        $scope.headerTemplateUrl = ngObibaMicaAccessTemplateUrl.getHeaderUrl('view');
        $scope.footerTemplateUrl = ngObibaMicaAccessTemplateUrl.getFooterUrl('view');
        $scope.submit = submitForm;
        $scope.reopen = reOpen;
        $scope.review = review;
        $scope.approve = approve;
        $scope.reject = reject;
        $scope.conditionallyApprove = conditionallyApprove;
        $scope.UserProfileService = UserProfileService;


        $scope.getProfileEmail = getProfileEmail;
        $scope.userProfile = function (profile) {
          $scope.applicant = profile;
          $uibModal.open({
            scope: $scope,
            templateUrl: 'access/views/data-access-request-profile-user-modal.html'
          });
        };

        $scope.dataAccessRequest = {};
        $scope.getDataAccessListPageUrl = DataAccessEntityService.getListDataAccessRequestPageUrl();
        $scope.printForm = printForm;
        $scope.getFullName = getFullName;
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onDeleteConfirmed);
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onDeleteCommentConfirmed);
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onStatusOpened);
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onStatusReviewed);
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onStatusConditionallyApproved);
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onStatusApproved);
        $scope.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onStatusRejected);
        $rootScope.$on('$translateChangeSuccess', initializeForm);

        $scope.tabs = { activeTab: 0 };
        $scope.TAB_NAMES = TAB_NAMES;
        $scope.forms = {};
        $scope.form = {
          schema: null,
          definition: null,
          model: {},
          comments: null
        };

        if ($routeParams.id) {
          initializeForm().then(function() {
            getRequest();
          });

        }
      }])

  .controller('DataAccessRequestEditController', ['$rootScope',
    '$scope',
    '$q',
    '$routeParams',
    '$location',
    '$uibModal',
    'DataAccessRequestsResource',
    'DataAccessRequestResource',
    'DataAccessFormConfigResource',
    'AlertService',
    'ServerErrorUtils',
    'SessionProxy',
    'DataAccessEntityService',
    'ngObibaMicaAccessTemplateUrl',
    'DataAccessRequestConfig',
    'SfOptionsService',
    'FormDirtyStateObserver',
    'DataAccessRequestDirtyStateService',

    function ($rootScope,
      $scope,
      $q,
      $routeParams,
      $location,
      $uibModal,
      DataAccessRequestsResource,
      DataAccessRequestResource,
      DataAccessFormConfigResource,
      AlertService,
      ServerErrorUtils,
      SessionProxy,
      DataAccessEntityService,
      ngObibaMicaAccessTemplateUrl,
      DataAccessRequestConfig,
      SfOptionsService,
      FormDirtyStateObserver,
      DataAccessRequestDirtyStateService) {

      var onSuccess = function (response, getResponseHeaders) {
        FormDirtyStateObserver.unobserve();
        var parts = getResponseHeaders().location.split('/');
        $location.path('/data-access-request/' + parts[parts.length - 1]).replace();
      };

      var onError = function (response) {
        AlertService.alert({
          id: 'DataAccessRequestEditController',
          type: 'danger',
          msg: ServerErrorUtils.buildMessage(response)
        });
      };

      $scope.getDataAccessListPageUrl = DataAccessEntityService.getListDataAccessRequestPageUrl();

      var validate = function (form) {
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

      var cancel = function () {
        $location.path('/data-access-request' + ($routeParams.id ? '/' + $routeParams.id : 's')).replace();
      };

      var save = function () {
        $scope.dataAccessRequest.content = angular.toJson($scope.sfForm.model || {});
        function doSaveOnGoingRequest() {
          DataAccessRequestResource.save($scope.dataAccessRequest, function () {
            FormDirtyStateObserver.unobserve();
            $location.path('/data-access-request' + ($scope.dataAccessRequest.id ? '/' + $scope.dataAccessRequest.id : 's')).replace();
          }, onError);
        }

        if ($scope.newRequest) {
          DataAccessRequestsResource.save($scope.dataAccessRequest, onSuccess, onError);
        } else {
          var isUnusual = ['OPENED', 'CONDITIONALLY_APPROVED'].indexOf($scope.dataAccessRequest.status) === -1;

          if (isUnusual) {
            $scope.$broadcast('schemaFormValidate');
            if ($scope.form.$valid) {
              doSaveOnGoingRequest();
            } else {
              validate($scope.form);
            }
          } else {
            doSaveOnGoingRequest();
          }
        }
      };

      function initializeForm() {
        // Retrieve form data

        $q.all([
          $routeParams.id ?
            DataAccessRequestResource.get({ id: $routeParams.id }, function onSuccess(request) {
              request.attachments = request.attachments || [];
              return request;
            }).$promise : {
              applicant: SessionProxy.login(),
              status: DataAccessEntityService.status.OPENED,
              attachments: []
            },
          DataAccessFormConfigResource.get().$promise
        ]).then(function (values) {
          $scope.dataAccessRequest = values[0];
          $scope.sfForm = values[1] || {};
          $scope.sfForm.model = $scope.dataAccessRequest.content ? JSON.parse($scope.dataAccessRequest.content) : {};

          $scope.loaded = true;
        }, function (response) {
          $scope.validForm = false;
          onError(response);
        });
      }

      $rootScope.$on('$translateChangeSuccess', function () {
        initializeForm();
      });

      initializeForm();

      $scope.loaded = false;
      $scope.config = DataAccessRequestConfig.getOptions();
      $scope.validForm = true;
      $scope.requestId = $routeParams.id;
      $scope.newRequest = $routeParams.id ? false : true;
      $scope.cancel = cancel;
      $scope.save = save;
      $scope.editable = true;
      $scope.validate = validate;
      $scope.headerTemplateUrl = ngObibaMicaAccessTemplateUrl.getHeaderUrl('form');
      $scope.footerTemplateUrl = ngObibaMicaAccessTemplateUrl.getFooterUrl('form');
      $scope.sfForm = null;

      FormDirtyStateObserver.observe($scope);

      DataAccessRequestDirtyStateService.setForm($scope.form);
      $scope.$on('$destroy', function () {
        DataAccessRequestDirtyStateService.setForm(null);
      });

    }]);
