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
