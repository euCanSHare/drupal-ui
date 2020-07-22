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

(function () {

  function Controller ($rootScope,
                       DataAccessEntityUrls,
                       DataAccessEntityResource,
                       DataAccessEntityService,
                       NOTIFICATION_EVENTS,
                       SessionProxy,
                       USER_ROLES,
                       ngObibaMicaAccessTemplateUrl,
                       DataAccessRequestConfig,
                       ngObibaMicaUrl,
                       $translate,
                       UserProfileService,
                       UserProfileModalService) {
    var ctrl = this;

    function initializeAddButtonCaption() {
      return ctrl.parentId === null ?
        ctrl.config.newRequestButtonCaption || 'data-access-request.add' :
        'data-access-amendment.add';
    }

    function initializeNoneCaption() {
      return ctrl.parentId === null ? 'data-access-request.none' : 'data-access-amendment.none';
    }

    function onInit () {
      ctrl.headerTemplateUrl = ngObibaMicaAccessTemplateUrl.getHeaderUrl ('list');
      ctrl.footerTemplateUrl = ngObibaMicaAccessTemplateUrl.getFooterUrl ('list');
      ctrl.config = DataAccessRequestConfig.getOptions ();
      ctrl.searchStatus = {};
      ctrl.loading = true;
      ctrl.addButtonCaption = initializeAddButtonCaption();
      ctrl.noneCaption = initializeNoneCaption();
      ctrl.actions = DataAccessEntityService.actions;
      ctrl.showApplicant = SessionProxy.roles ().filter (function (role) {
        return [USER_ROLES.dao, USER_ROLES.admin].indexOf (role) > -1;
      }).length > 0;

      var emitter = $rootScope.$new();
      ctrl.$on = angular.bind(emitter, emitter.$on);
      ctrl.$on(NOTIFICATION_EVENTS.confirmDialogAccepted, onConfirmDelete);

      DataAccessEntityService.getStatusFilterData (function (translated) {
        ctrl.REQUEST_STATUS = translated;
      });
    }

    function onSuccess (reqs) {
      for (var i = 0; i < reqs.length; i++) {
        var req = reqs[i];
        if (req.status !== 'OPENED') {
          for (var j = 0; j < req.statusChangeHistory.length; j++) {
            var change = req.statusChangeHistory[j];
            if (change.from === 'OPENED' && change.to === 'SUBMITTED') {
              req.submissionDate = change.changedOn;
            }
          }
        }
        req.lastUpdate = req.timestamps.lastUpdate;

        if (req.amendmentsSummary && req.amendmentsSummary.lastModifiedDate && new Date(req.amendmentsSummary.lastModifiedDate) > new Date(req.timestamps.lastUpdate)) {
          req.lastUpdate = req.amendmentsSummary.lastModifiedDate;
        }
      }
      ctrl.requests = reqs;
      ctrl.loading = false;
    }

    function onError() {
      ctrl.loading = false;
    }

    function onChanges (changed) {
      if (changed.parentId && changed.parentId.currentValue !== undefined) {
        if (changed.parentId.currentValue === null) {
          ctrl.listUrl = DataAccessEntityUrls.getDataAccessRequestsUrl();
          ctrl.entityBaseUrl = DataAccessEntityUrls.getDataAccessRequestBaseUrl();
        } else {
          ctrl.listUrl = DataAccessEntityUrls.getDataAccessAmendmentsUrl(ctrl.parentId);
          ctrl.entityBaseUrl = DataAccessEntityUrls.getDataAccessAmendmentBaseUrl(ctrl.parentId);
        }

        DataAccessEntityResource.list (ctrl.listUrl).$promise.then (onSuccess, onError);
      }
    }

    function deleteRequest (request) {
      ctrl.requestToDelete = request.id;
      $rootScope.$broadcast (NOTIFICATION_EVENTS.showConfirmDialog,
        {
          titleKey: 'data-access-request.delete-dialog.title',
          messageKey: 'data-access-request.delete-dialog.message',
          messageArgs: [request.title, request.applicant]
        }, request.id

      );
    }

    function getCsvExportHref() {
      return ngObibaMicaUrl.getUrl ('DataAccessRequestsExportCsvResource').replace (':lang', $translate.use ());
    }

    function getHistoryExportHref() {
      return ngObibaMicaUrl.getUrl ('DataAccessRequestsExportHistoryResource').replace (':lang', $translate.use ());
    }

    function getDataAccessRequestPageUrl() {
      var DataAccessClientDetailPath = ngObibaMicaUrl.getUrl ('DataAccessClientDetailPath');
      if (DataAccessClientDetailPath) {
        return ngObibaMicaUrl.getUrl ('BaseUrl') + ngObibaMicaUrl.getUrl ('DataAccessClientDetailPath');
      }
      else {
        return null;
      }
    }

    function onConfirmDelete(event, id) {
      if (ctrl.requestToDelete === id) {
        DataAccessEntityResource.delete (ctrl.entityBaseUrl, ctrl.requestToDelete).$promise.then(
          function () {
            ctrl.loading = true;
            DataAccessEntityResource.list(ctrl.listUrl).$promise.then(onSuccess, onError);
          },
          onError
        );

        delete ctrl.requestToDelete;
      }
    }

    ctrl.getHistoryExportHref = getHistoryExportHref;
    ctrl.getCsvExportHref = getCsvExportHref;
    ctrl.getDataAccessRequestPageUrl = getDataAccessRequestPageUrl;
    ctrl.deleteRequest = deleteRequest;
    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;
    ctrl.UserProfileService = UserProfileService;
    ctrl.UserProfileModalService = UserProfileModalService;
  }

  ngObibaMica.access
    .component ('entityList', {
      bindings: {
        parentId: '<',
        canAdd: '<'
      },
      templateUrl: 'access/components/entity-list/component.html',
      controller: ['$rootScope',
        'DataAccessEntityUrls',
        'DataAccessEntityResource',
        'DataAccessEntityService',
        'NOTIFICATION_EVENTS',
        'SessionProxy',
        'USER_ROLES',
        'ngObibaMicaAccessTemplateUrl',
        'DataAccessRequestConfig',
        'ngObibaMicaUrl',
        '$translate',
        'UserProfileService',
        'UserProfileModalService', Controller]
    });
}) ();
