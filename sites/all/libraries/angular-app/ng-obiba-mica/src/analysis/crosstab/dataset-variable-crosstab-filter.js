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

  ngObibaMica.DatasetVariableCrosstab

    .filter('variableCategory',
      function () {
        return function (categories, category) {
          var result = null;

          if (categories) {
            result = categories.filter(function (cat) {
              return cat.name === category;
            });
          }

          return result ? result[0] : null;
        };
      })

    .filter('variableLabel', ['AttributeService',
      function (AttributeService) {
        return function (variable) {
          var label = '';
          if (variable) {
            var attributes = AttributeService.getAttributes(variable, ['label']);
            if (attributes) {
              attributes.forEach(
                function (attribute) {
                  label = AttributeService.getValue(attribute);
                  return false;
                });
            }

            return label;
          }
        };
      }])

    .filter('roundNumber', ['$filter',
      function ($filter) {
        return function (value) {
          return isNaN(value) ? value : $filter('number')(value, 2);
        };
      }]);

})();
