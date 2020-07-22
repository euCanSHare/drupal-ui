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
  function DataAccessEntityService($translate, SessionProxy, USER_ROLES, ngObibaMicaUrl) {
    var statusList = {
      OPENED: 'OPENED',
      SUBMITTED: 'SUBMITTED',
      REVIEWED: 'REVIEWED',
      CONDITIONALLY_APPROVED: 'CONDITIONALLY_APPROVED',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED'
    };

    var actions = {
      canViewProfile: function (role) {
        var found = false;
        var currentUserRoles = SessionProxy.roles();
        angular.forEach(currentUserRoles, function (value) {
          if (value === role || value === USER_ROLES.admin) {
            found = true;
          }
        });
        return found;
      },
      canView: function (request) {
        return canDoAction(request, 'VIEW');
      },

      canEditStartDate: function (request) {
        return request.status === 'APPROVED' && canDoAction(request, 'EDIT_ACTION_LOGS');
      },

      canEdit: function (request) {
        return canDoAction(request, 'EDIT');
      },

      canEditStatus: function (request) {
        return canDoAction(request, 'EDIT_STATUS');
      },

      canDelete: function (request) {
        return canDoAction(request, 'DELETE');
      },

      canEditAttachments: function (request) {
        return canDoAction(request, 'EDIT_ATTACHMENTS');
      },

      canDeleteAttachments: function (request) {
        return canDoAction(request, 'DELETE_ATTACHMENTS');
      },

      canAddAmendments: function (request) {
        return request['obiba.mica.DataAccessAmendmentDto.amendment'] ? true : canDoAction(request, 'ADD_AMENDMENTS');
      },

      canEditActionLogs: function (request) {
        return canDoAction(request, 'EDIT_ACTION_LOGS');
      },

      canViewPrivateComments: function (request) {
        return canDoAction(request, 'VIEW_PRIVATE_COMMENTS');
      },

      canAddPrivateComments: function (request) {
        return canDoAction(request, 'ADD_PRIVATE_COMMENTS');
      }
    };

    var nextStatus = {
      canSubmit: function (request) {
        return canChangeStatus(request, 'SUBMITTED');
      },

      canReopen: function (request) {
        return canChangeStatus(request, 'OPENED');
      },

      canReview: function (request) {
        return canChangeStatus(request, 'REVIEWED');
      },

      canConditionallyApprove: function (request) {
        return canChangeStatus(request, 'CONDITIONALLY_APPROVED');
      },

      canApprove: function (request) {
        return canChangeStatus(request, 'APPROVED');
      },

      canReject: function (request) {
        return canChangeStatus(request, 'REJECTED');
      }

    };

    function getStatusFilterData(userCallback) {
      if (userCallback) {
        $translate(Object.keys(statusList)).then(function (translation) {
          userCallback(Object.keys(translation).map(function (key) {
            return {key: key, translation: translation[key]};
          }));
        });
      }
    }

    function canDoAction(request, action) {
      return request.actions ? request.actions.indexOf(action) !== - 1 : false;
    }

    function canChangeStatus(request, to) {
      return request.nextStatus ? request.nextStatus.indexOf(to) !== - 1 : null;
    }

    function getHistoryLogId(log) {
      var id = 'opened';

      if (log.action) {
        id = 'action';
      } else if (log.from !== 'OPENED' || log.from !== log.to) {
        switch (log.to) {
          case 'OPENED':
            id = 'reopened';
            break;
          case 'SUBMITTED':
            id = 'submitted';
            break;
          case 'REVIEWED':
            id = 'reviewed';
            break;
          case 'CONDITIONALLY_APPROVED':
            id = 'conditionallyApproved';
            break;
          case 'APPROVED':
            id = 'approved';
            break;
          case 'REJECTED':
            id = 'rejected';
            break;
        }
      }

      return id;
    }

    function processLogsHistory(logs) {
      return (logs || []).map(function(log) {

        switch (getHistoryLogId(log)) {
          case 'opened':
            log.msg = 'data-access-request.histories.opened';
            log.icon =  'glyphicon glyphicon-saved';
            break;
          case 'reopened':
            log.msg = 'data-access-request.histories.reopened';
            log.icon =  'glyphicon glyphicon-saved';
            break;
          case 'submitted':
            log.msg = 'data-access-request.histories.submitted';
            log.icon =  'glyphicon glyphicon-export';
            break;
          case 'reviewed':
            log.msg ='data-access-request.histories.reviewed';
            log.icon =  'glyphicon glyphicon-check';
            break;
          case 'conditionallyApproved':
            log.msg = 'data-access-request.histories.conditionallyApproved';
            log.icon =  'glyphicon glyphicon-unchecked';
            break;
          case 'approved':
            log.msg = 'data-access-request.histories.approved';
            log.icon =  'glyphicon glyphicon-ok';
            break;
          case 'rejected':
            log.msg = 'data-access-request.histories.rejected';
            log.icon =  'glyphicon glyphicon-remove';
            break;
          case 'action':
            log.msg = log.action;
            log.icon =  'glyphicon glyphicon-play-circle';
            log.changedOn = new Date(log.changedOn).toISOString();
            break;
        }

        return log;
      });
    }

    function getListDataAccessRequestPageUrl() {
      var DataAccessClientListPath = ngObibaMicaUrl.getUrl('DataAccessClientListPath');
      if(DataAccessClientListPath){
        return ngObibaMicaUrl.getUrl('BaseUrl') + ngObibaMicaUrl.getUrl('DataAccessClientListPath');
      }
      else{
        return null;
      }
    }

    this.status = statusList;
    this.actions = actions;
    this.nextStatus = nextStatus;
    this.getStatusFilterData = getStatusFilterData;
    this.processLogsHistory = processLogsHistory;
    this.getListDataAccessRequestPageUrl = getListDataAccessRequestPageUrl;

    return this;
  }

  ngObibaMica.access.service('DataAccessEntityService',
    ['$translate', 'SessionProxy', 'USER_ROLES', 'ngObibaMicaUrl', DataAccessEntityService]);

}) ();