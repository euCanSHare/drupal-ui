'use strict';

ngObibaMica.search
  .filter('regex', function () {
    return function (elements, regex, fields, lang) {
      var out = [];

      try {
        var pattern = new RegExp(regex, 'i');
        out = elements.filter(function (element) {
          return fields.some(function (field) {
            var value = element[field];

            if (angular.isArray(value) && lang) {
              return value.filter(function (item) {
                return item.locale === lang;
              }).some(function (item) {
                return pattern.test(item.text);
              });
            }

            return pattern.test(value);
          });
        });
      } catch (e) {
      }

      return out;
    };
  });