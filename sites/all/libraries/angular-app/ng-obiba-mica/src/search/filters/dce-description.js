'use strict';

ngObibaMica.search
  .filter('dceDescription', function () {
    return function (input) {
      return input.split(':<p>').map(function (d) {
        return '<p>' + d;
      })[2];
    };
  });