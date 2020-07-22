angular.module("sfRadioGroupCollectionTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/radio-group-collection.html","<div class=\"form-group\"\n     ng-controller=\"RadioGroupCollectionController\"\n     ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(),\n                \'has-success\': form.disableSuccessState !== true && hasSuccess(),\n                \'has-feedback\': form.feedback !== false }\"\n     sf-field-model\n     schema-validate=\"form\" >\n  <label ng-if=\"showTitle()\">{{showTitle()}}</label>\n  <div ng-repeat=\"item in form.schema.items\">\n    <div class=\"row\" ng-if=\"!form.checkboxMode\">\n      <div class=\"col-xs-6\">\n        <span class=\"control-label\" ng-bind-html=\"item.name\"></span>\n      </div>\n      <div class=\"col-xs-6\">\n        <label class=\"radio-inline\" ng-repeat=\"transformedValue in transformedValues\">\n          <input type=\"radio\" ng-model=\"model[key][item.key]\" name=\"{{key + \'.\' + item.key}}\" id=\"inlineRadio{{$index}}\" value=\"{{transformedValue.key}}\"> {{transformedValue.caption}}\n        </label>\n      </div>\n    </div>\n\n    <div ng-if=\"form.checkboxMode\">\n        <label class=\"checkbox-inline\">\n          <input type=\"checkbox\" ng-model=\"model[key][item.key]\" name=\"{{key + \'.\' + item.key}}\" id=\"checkbox{{$index}}\" value=\"{{item.key}}\">\n          <span ng-bind-html=\"item.name\"></span>\n        </label>\n    </div>\n  </div>\n  <span class=\"help-block\" sf-message=\"form.description\"></span>\n</div>\n");}]);
angular.module('sfRadioGroupCollection', [
  'schemaForm',
  'sfRadioGroupCollectionTemplates'
]).config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfBuilderProvider', 'sfPathProvider',
  function (schemaFormProvider, schemaFormDecoratorsProvider, sfBuilderProvider, sfPathProvider) {

    var radioGroupCollection = function (name, schema, options) {
      if (schema.type === 'object' && schema.format === 'radioGroupCollection') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key = options.path;
        f.type = 'radioGroupCollection';
        f.validationMessage = options.global.validationMessage || {};
        f.validationMessage.allItemsSelected = f.validationMessage.allItemsSelected || 'All options must be selected.';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };

    schemaFormProvider.defaults.object.unshift(radioGroupCollection);

    schemaFormDecoratorsProvider.defineAddOn(
      'bootstrapDecorator',           // Name of the decorator you want to add to.
      'radioGroupCollection',                      // Form type that should render this add-on
      'src/templates/radio-group-collection.html',  // Template name in $templateCache
      sfBuilderProvider.stdBuilders   // List of builder functions to apply.
    );

  }])
  .controller('RadioGroupCollectionController', ['$scope', function ($scope) {

    function validateAllItemsSelected(value) {
      if (value && this.required === true && this.schema.items) {
        if (this.checkboxMode) {
          return Object.keys(value).some(function (i) { return value[i]; });
        } else {
          return this.schema.items.length === Object.keys(value).length;
        }
      }
      return true;
    }

    $scope.$watch('ngModel.$modelValue', function () {
      if ($scope.ngModel.$validate) {
        // Make sure that allowInvalid is always true so that the model is preserved when validation fails

        $scope.ngModel.$validate();
        if ($scope.ngModel.$invalid) { // The field must be made dirty so the error message is displayed
          $scope.ngModel.$dirty = true;
          $scope.ngModel.$pristine = false;
        }
      }
      else {
        $scope.ngModel.$setViewValue(ngModel.$viewValue);
      }
    }, true);

    $scope.$watch('form', function () {
       $scope.ngModel.$validators = {
         allItemsSelected: validateAllItemsSelected.bind($scope.form)
      };

      if (!Array.isArray($scope.form.schema.values)) {
        var values = $scope.form.schema.values || {};
        $scope.transformedValues =  Object.keys(values).map(function (valueKey) {
          return {'key': valueKey, 'caption': values[valueKey]};
        });
      } else {
        $scope.transformedValues = $scope.form.schema.values;
      }

      $scope.key = $scope.form.key[0];
      $scope.form.disableErrorState = $scope.form.hasOwnProperty('readonly') && $scope.form.readonly;
    });
  }]);
