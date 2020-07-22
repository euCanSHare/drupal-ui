'use strict';

ngObibaMica.search
  .filter('renderableTargets', ['RqlQueryService', function (RqlQueryService) {
    return function (targets) {
      return RqlQueryService.getRenderableTargetCriteria(targets);
    };
  }]);