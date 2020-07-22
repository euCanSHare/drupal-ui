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

/* global targetToType */

ngObibaMica.lists
    .service('sortWidgetService', ['$filter', '$location', 'RqlQueryService', 'sortWidgetOptions', function ($filter, $location, RqlQueryService, sortWidgetOptions) {
        var newOptions = sortWidgetOptions.getOptions();
        var self = this;
        this.getSortOrderOptions = function () {
            newOptions.sortOrderField.options.map(function (option) {
                return $filter('translate')(option.label);
            });
            return {
                options: newOptions.sortOrderField.options
            };
        };
        this.getSortOrderOption = function (value) {
            var selectedOption = null;
            if (!value) {
                value = newOptions.sortOrderField.defaultValue;
            }
            angular.forEach(self.getSortOrderOptions().options, function (option) {
                if (option.value === value) {
                    selectedOption = option;
                }
            });
            return selectedOption ? selectedOption : self.getSortOrderOption(newOptions.sortOrderField.defaultValue);
        };

        this.getSortArg = function () {
            var search = $location.search();
            var rqlQuery = RqlQueryService.parseQuery(search.query);
            if (rqlQuery) {
                var rqlSort = RqlQueryService.getTargetQuerySort(targetToType(rqlQuery.args[0].name), rqlQuery);
                if (rqlSort) {
                    return rqlSort.args[0];
                }
            }
            return newOptions.sortOrderField.defaultValue;
        };

        this.getLabel = function (selectSort, valueSort) {
            var result = null;
            angular.forEach(selectSort.options, function (value) {
                if (value.value === valueSort) {
                    result = value.label;
                }
            });
            return result;
        };

    }]);