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

/* global NgObibaMicaTemplateUrlFactory */

(function () {

  ngObibaMica.search
    .config(['$provide', function ($provide) {
      $provide.provider('ngObibaMicaSearchTemplateUrl', new NgObibaMicaTemplateUrlFactory().create(
        {
          search: { header: null, footer: null },
          searchStudiesResultTable: { template: null },
          searchNetworksResultTable: { template: null },
          searchDatasetsResultTable: { template: null },
          searchCriteriaRegionTemplate: { template: null },
          vocabularyFilterDetailHeading: { template: null },
          CriterionDropdownTemplate: { template: null },
          searchResultList: { template: null },
          searchInputList: { template: null },
          searchResultCoverage: { template: null },
          searchResultGraphics: { template: null },
          classifications: { header: null, footer: null },
          searchCellStatValue: { template: null },
        }
      ));
    }]);
})();

