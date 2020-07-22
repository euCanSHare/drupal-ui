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

function NgObibaMicaListsOptionsFactory() {
  var defaultOptions = {
    listSearchOptions:{
      network: {
        fields: ['studyIds', 'acronym.*', 'name.*', 'description.*', 'logo']
      },
      study: {
        fields: ['logo', 'objectives.*', 'acronym.*', 'name.*', 'model.methods.design', 'model.numberOfParticipants.participant']
      },
      dataset: {
        fields: ['acronym.*', 'name.*', 'description.*', 'variableType',
          'studyTable.studyId',
          'studyTable.project',
          'studyTable.table',
          'studyTable.populationId',
          'studyTable.dataCollectionEventId',
          'harmonizationTable.studyId',
          'harmonizationTable.project',
          'harmonizationTable.table',
          'harmonizationTable.populationId'
        ]
      }
    },
    listOptions: {
      networkOptions: {
        showStudyBadge: true,
        showDatasetBadge:true,
        showVariableBadge: true
      },
      studyOptions: {
              studiesCountCaption: true,
              studiesSearchForm: true,
              studiesSupplInfoDetails: true,
              studiesTrimmedDescription: true,
              showNetworkBadge: true,
              showDatasetBadge:true,
              showVariableBadge: true
      },
      datasetOptions: {
              showNetworkBadge: true,
              showStudyBadge:true,
              showVariableBadge: true
      }
    }
  };

  function NgObibaMicaListsOptions() {
    this.getOptions = function () {
      return defaultOptions;
    };
  }

  this.$get = function () {
    return new NgObibaMicaListsOptions();
  };

  this.setOptions = function (value) {
    Object.keys(value).forEach(function (option) {
      if(option in defaultOptions){
        defaultOptions[option] = value[option];
      }
    });
  };

}

function SortWidgetOptionsProvider() {
  var defaultOptions = {
    sortOrderField: {
      options: [
        {
          value: '-_score',
          label: 'relevance'
        },
        {
          value: 'name',
          label: 'name'
        },
        {
          value: '-name',
          label: 'name'
        },
        {
          value: 'acronym',
          label: 'acronym'
        },
        {
          value: '-acronym',
          label: 'acronym'
        }
      ],
      defaultValue: '-_score'
    }
  };

  var self = this;

  function SortWidgetOptions(defaultOptions){
    var options = defaultOptions;
    this.getOptions = function() {
      return options;
    };
  }

  this.getDefaultOptions = function(){
    return self.defaultOptions;
  };

  this.$get = function () {
    return new SortWidgetOptions(defaultOptions);
  };

  this.setOptions = function (value) {
    Object.keys(value).forEach(function (optionKey) {
      if(optionKey in defaultOptions){
        if(value[optionKey].options){
          defaultOptions[optionKey].options = defaultOptions[optionKey].options.concat(value[optionKey].options);
          defaultOptions[optionKey].default = value[optionKey].default;
        }
      }
    });
  };
}

ngObibaMica.lists = angular.module('obiba.mica.lists', ['obiba.mica.search']);

ngObibaMica.lists
  .run()
  .config(['$provide', function($provide){
    $provide.provider('ngObibaMicaLists', NgObibaMicaListsOptionsFactory);
  }])
  .config(['ngObibaMicaSearchTemplateUrlProvider',
    function (ngObibaMicaSearchTemplateUrlProvider) {
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('searchStudiesResultTable', 'lists/views/list/studies-search-result-table-template.html');
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('searchNetworksResultTable', 'lists/views/list/networks-search-result-table-template.html');
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('searchDatasetsResultTable', 'lists/views/list/datasets-search-result-table-template.html');
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('searchResultList', 'lists/views/search-result-list-template.html');
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('searchInputList', 'lists/views/input-search-widget/input-search-widget-template.html');
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('searchCriteriaRegionTemplate', 'lists/views/region-criteria/search-criteria-region-template.html');
      ngObibaMicaSearchTemplateUrlProvider.setTemplateUrl('CriterionDropdownTemplate', 'lists/views/region-criteria/criterion-dropdown-template.html');
    }])
  .config(['$provide', function($provide){
      $provide.provider('sortWidgetOptions', SortWidgetOptionsProvider);
    }])
  .filter('getBaseUrl', function () {
    return function (param) {
      return '/mica/' + param;
    };
  })
  .filter('doSearchQuery', function () {
    return function (type, query) {
      return '/mica/repository#/search?type=' + type + '&query=' + query + '&display=list';
    };
  });
