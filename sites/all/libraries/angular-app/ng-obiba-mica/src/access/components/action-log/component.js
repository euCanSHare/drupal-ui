'use strict';

(function () {
  function ActionLogEditorController(SessionProxy, $filter) {
    var ctrl = this;

    ctrl.filterOutItemFromCollection = function (item, collection) {
      return (collection || []).filter(function (element) {
        return element.action !== item.action || element.author !== item.author || element.changedOn !== item.changedOn;
      });
    };

    ctrl.sourceCollectionWithout = function (item) {
      return ctrl.filterOutItemFromCollection(item, ctrl.sourceCollection);
    };

    ctrl.replaceActionNameByTranslationKey = function (item) {
      // replace action translation with key if applicable
      var index = (ctrl.predefinedActionNames || []).indexOf(item.action);
      if (index > -1) {
        item.action = ctrl.predefinedActions[index];
      }
    };

    ctrl.add = function (item) {
      ctrl.showError = false;
      if (item && item.action && item.changedOn) {
        ctrl.replaceActionNameByTranslationKey(item);
        item.changedOn = item.changedOn.toISOString();

        if (!item.author) {
          item.author = SessionProxy.login();
        }

        var result = ctrl.sourceCollectionWithout(item);
        result.push(item);

        if (ctrl.update && typeof ctrl.update === 'function') {
          ctrl.update({ logs: result });

          ctrl.item = {};
          ctrl.changedOn = null;
        } else {
          console.error('Did not create', item);
        }
      } else {
        ctrl.showError = true;
      }
    };

    ctrl.predefinedActionsChanged = function (changes) {
      if (changes.predefinedActions && changes.predefinedActions.currentValue) {
        ctrl.predefinedActionNames = ctrl.predefinedActions.map(function (actionKey) {
          return $filter('translate')(actionKey);
        });
      }
    };

    ctrl.$onChanges = function (changes) {
      ctrl.predefinedActionsChanged(changes);
    };
  }

  function ActionLogItemEditorController(SessionProxy, $uibModal, $filter) {
    var ctrl = this;
    ActionLogEditorController.call(ctrl, SessionProxy, $filter);

    function isAnActionLog(item) {
      return item && item.hasOwnProperty('action') && item.hasOwnProperty('author') && item.hasOwnProperty('changedOn');
    }

    ctrl.remove = function (item) {
      $uibModal.open({
        templateUrl: 'access/components/action-log/item/delete-modal.html',
        controller: ['$uibModalInstance', 'actionLogItem', function ($uibModalInstance, actionLogItem) { this.item = actionLogItem; }],
        controllerAs: '$modal',
        resolve: {
          actionLogItem: function () {
            return { action: $filter('translate')(item.action), author: item.author, changedOn: moment(item.changedOn).calendar() };
          }
        }
      }).result.then(function () {
        var result = ctrl.sourceCollectionWithout(item);

        if (result.length < ctrl.sourceCollection.length && (ctrl.update && typeof ctrl.update === 'function')) {
          ctrl.update({ logs: result });
        } else {
          console.error('Did not remove', item);
        }
      });
    };

    ctrl.edit = function (item) {
      $uibModal.open({
        templateUrl: 'access/components/action-log/item/edit-modal.html',
        controller: ['$uibModalInstance', 'actionLogItem', 'predefinedActionNames',
          function ($uibModalInstance, actionLogItem, predefinedActionNames) {
            this.item = actionLogItem;
            this.predefinedActionNames = predefinedActionNames;
          }],
        controllerAs: '$modal',
        size: 'sm',
        resolve: {
          actionLogItem: function () {
            return { action: $filter('translate')(item.action), author: item.author, changedOn: new Date(item.changedOn) };
          },
          predefinedActionNames: function () {
            return ctrl.predefinedActionNames;
          }
        }
      }).result.then(function (editionResult) {
        ctrl.replaceActionNameByTranslationKey(editionResult);
        editionResult.changedOn = editionResult.changedOn.toISOString();

        if (ctrl.update && typeof ctrl.update === 'function') {
          var result = ctrl.sourceCollectionWithout(item);
          result = ctrl.filterOutItemFromCollection(editionResult, result);

          result.push(editionResult);
          ctrl.update({ logs: result });
        } else {
          console.error('Did not update', item);
        }
      });
    };

    ctrl.$onChanges = function (changes) {
      ctrl.predefinedActionsChanged(changes);
      ctrl.showButtons = ctrl.item && isAnActionLog(ctrl.item);
    };
  }

  angular.module('obiba.mica.access').component('actionLogEditor', {
    bindings: {
      sourceCollection: '<',
      predefinedActions: '<',
      update: '&'
    },
    templateUrl: 'access/components/action-log/component.html',
    controller: ['SessionProxy', '$filter', ActionLogEditorController]
  });

  angular.module('obiba.mica.access').component('actionLogItemEditor', {
    bindings: {
      item: '<',
      sourceCollection: '<',
      predefinedActions: '<',
      update: '&'
    },
    templateUrl: 'access/components/action-log/item/component.html',
    controller: ['SessionProxy', '$uibModal', '$filter', ActionLogItemEditorController]
  });
})();