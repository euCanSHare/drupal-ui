angular.module('obibaShims', [])
  .config(['$httpProvider',
    function ($httpProvider) {
      if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
      }
      // extra
      $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
      $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';



      if (!Text.prototype.getAttribute) {
        Text.prototype.getAttribute = function () {
          return '';
        };

        Text.prototype.setAttribute = function () {
        };
      }

    }
  ]);
