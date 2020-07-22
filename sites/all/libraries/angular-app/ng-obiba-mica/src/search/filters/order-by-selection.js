'use strict';

ngObibaMica.search
  .filter('orderBySelection', function () {
    return function (elements, selections) {
      if (!elements) {
        return [];
      }

      var selected = [];
      var unselected = [];

      elements.forEach(function (element) {
        if (selections[element.key]) {
          selected.push(element);
        } else {
          unselected.push(element);
        }
      });

      return selected.concat(unselected);
    };
  });