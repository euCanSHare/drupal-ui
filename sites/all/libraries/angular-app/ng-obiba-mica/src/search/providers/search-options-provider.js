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

/* global QUERY_TARGETS */
/* global DISPLAY_TYPES */

(function () {
  var FIELDS_TO_FILTER = ['name', 'title', 'description', 'keywords'];

  function NgObibaMicaSearchOptionsWrapper() {
    var options = {
      searchLayout: 'layout2',
      taxonomyPanelOptions: {
        network: {
          taxonomies: { 'Mica_network': { trKey: 'properties' } }
        },
        study: {
          taxonomies: { 'Mica_study': { trKey: 'properties' } }
        },
        dataset: {
          taxonomies: { 'Mica_dataset': { trKey: 'properties' } }
        },
        variable: {
          taxonomies: {
            'Mica_variable': { trKey: 'properties' }
          }
        },
        fieldsToFilter: FIELDS_TO_FILTER
      },
      obibaListOptions: {
        countCaption: true,
        searchForm: true,
        supplInfoDetails: true,
        trimmedDescription: true
      },
      targetTabsOrder: [QUERY_TARGETS.VARIABLE, QUERY_TARGETS.DATASET, QUERY_TARGETS.STUDY, QUERY_TARGETS.NETWORK],
      searchTabsOrder: [DISPLAY_TYPES.LIST, DISPLAY_TYPES.COVERAGE, DISPLAY_TYPES.GRAPHICS],
      resultTabsOrder: [QUERY_TARGETS.VARIABLE, QUERY_TARGETS.DATASET, QUERY_TARGETS.STUDY, QUERY_TARGETS.NETWORK],
      showAllFacetedTaxonomies: true,
      showFacetTermsWithZeroCount: false,
      showSearchBox: true,
      showSearchBrowser: true,
      showCopyQuery: true,
      showSearchRefreshButton: false,
      variableTaxonomiesOrder: [],
      studyTaxonomiesOrder: [],
      datasetTaxonomiesOrder: [],
      networkTaxonomiesOrder: [],
      hideNavigate: [],
      hideSearch: ['studyId', 'dceId', 'datasetId', 'networkId'],
      variables: {
        showSearchTab: true,
        listPageSize: 20,
        variablesColumn: {
          showVariablesTypeColumn: true,
          showVariablesStudiesColumn: true,
          showVariablesDatasetsColumn: true,
          showDatasetsStudiesColumn: true,
          showDatasetsVariablesColumn: true
        },
        fields: [
          'attributes.label.*',
          'variableType',
          'populationId',
          'dceId',
          'datasetId',
          'datasetAcronym'
        ],
        annotationTaxonomies: [
          'Mlstr_area'
        ],
        showCart: true
      },
      datasets: {
        showSearchTab: true,
        listPageSize: 20,
        showDatasetsSearchFilter: true,
        datasetsColumn: {
          showDatasetsAcronymColumn: true,
          showDatasetsTypeColumn: true,
          showDatasetsNetworkColumn: true,
          showDatasetsStudiesColumn: true,
          showDatasetsVariablesColumn: true
        },
        fields: [
          'acronym.*',
          'name.*',
          'variableType',
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
      },
      studies: {
        showSearchTab: true,
        listPageSize: 20,
        showStudiesSearchFilter: true,
        studiesColumn: {
          showStudiesTypeColumn: true,
          showStudiesDesignColumn: true,
          showStudiesQuestionnaireColumn: true,
          showStudiesPmColumn: true,
          showStudiesBioColumn: true,
          showStudiesOtherColumn: true,
          showStudiesParticipantsColumn: true,
          showStudiesNetworksColumn: true,
          showStudiesStudyDatasetsColumn: true,
          showStudiesHarmonizationDatasetsColumn: true,
          showStudiesVariablesColumn: false,
          showStudiesStudyVariablesColumn: true,
          showStudiesDataschemaVariablesColumn: true
        },
        fields: [
          'acronym.*',
          'name.*',
          'model.methods.design',
          'populations.dataCollectionEvents.model.dataSources',
          'model.numberOfParticipants.participant'
        ]
      },
      networks: {
        showSearchTab: true,
        listPageSize: 20,
        networksColumn: {
          showNetworksStudiesColumn: true,
          showNetworksStudyDatasetColumn: true,
          showNetworksHarmonizationDatasetColumn: true,
          showNetworksVariablesColumn: false,
          showNetworksStudyVariablesColumn: true,
          showNetworksDataschemaVariablesColumn: true
        },
        fields: [
          'acronym.*',
          'name.*',
          'studyIds'
        ]
      },
      coverage: {
        total: {
          showInHeader: true,
          showInFooter: false
        },
        groupBy: {
          study: true,
          dce: true,
          dataset: true
        }
      }
    };

    function sanitizeFieldsToFilter(valueFieldsToFilter) {
      if (valueFieldsToFilter) {
        return valueFieldsToFilter.filter(function (valueField) {
          return FIELDS_TO_FILTER.indexOf(valueField) > -1;
        });
      }
      return null;
    }

    function normalizeOptions() {

      function removeItemByValue(array, value) {
        var index = array.indexOf(value);
        if (index > -1) {
          array.splice(index, 1);
        }
        return array;
      }

      options.coverage.groupBy.dce = options.coverage.groupBy.study && options.coverage.groupBy.dce;
      var canShowCoverage = Object.keys(options.coverage.groupBy).filter(function (canShow) {
        return options.coverage.groupBy[canShow];
      }).length > 0;

      if (!canShowCoverage) {
        removeItemByValue(options.searchTabsOrder, DISPLAY_TYPES.COVERAGE);
      }

      if (!options.networks.showSearchTab) {
        removeItemByValue(options.targetTabsOrder, QUERY_TARGETS.NETWORK);
        removeItemByValue(options.resultTabsOrder, QUERY_TARGETS.NETWORK);
      }

      if (!options.studies.showSearchTab) {
        removeItemByValue(options.searchTabsOrder, DISPLAY_TYPES.GRAPHICS);
        removeItemByValue(options.targetTabsOrder, QUERY_TARGETS.STUDY);
        removeItemByValue(options.resultTabsOrder, QUERY_TARGETS.STUDY);
      }
    }

    function setOptions(value) {
      options = angular.merge(options, value);
      //NOTICE: angular.merge merges arrays by position. Overriding manually.
      options.targetTabsOrder = value.targetTabsOrder || options.targetTabsOrder;
      options.searchTabsOrder = value.searchTabsOrder || options.searchTabsOrder;
      options.resultTabsOrder = value.resultTabsOrder || options.resultTabsOrder;
      options.showCopyQuery = value.showCopyQuery || options.showCopyQuery;
      options.variableTaxonomiesOrder = value.variableTaxonomiesOrder || options.variableTaxonomiesOrder;
      options.studyTaxonomiesOrder = value.studyTaxonomiesOrder || options.studyTaxonomiesOrder;
      options.datasetTaxonomiesOrder = value.datasetTaxonomiesOrder || options.datasetTaxonomiesOrder;
      options.networkTaxonomiesOrder = value.networkTaxonomiesOrder || options.networkTaxonomiesOrder;
      options.hideNavigate = value.hideNavigate || options.hideNavigate;
      options.hideSearch = value.hideSearch || options.hideSearch;
      //TODO: Needs a better mechanism for setting options
      options.studies.fields = value.studies && value.studies.fields || options.studies.fields;
      options.networks.fields = value.networks && value.networks.fields || options.networks.fields;
      options.datasets.fields = value.datasets && value.datasets.fields || options.datasets.fields;
      if (value.taxonomyPanelOptions) {
        options.taxonomyPanelOptions.fieldsToFilter = sanitizeFieldsToFilter(value.taxonomyPanelOptions.fieldsToFilter) || options.taxonomyPanelOptions.fieldsToFilter;
      }
      if (value.studies && value.studies.obibaListOptions) {
        options.obibaListOptions.countCaption = value.studies.obibaListOptions.studiesCountCaption === 0 ? value.studies.obibaListOptions.studiesCountCaption : true;
        options.obibaListOptions.searchForm = value.studies.obibaListOptions.studiesSearchForm === 0 ? value.studies.obibaListOptions.studiesSearchForm : true;
        options.obibaListOptions.supplInfoDetails = value.studies.obibaListOptions.studiesSupplInfoDetails === 0 ? value.studies.obibaListOptions.studiesSupplInfoDetails : true;
        options.obibaListOptions.trimmedDescription = value.studies.obibaListOptions.studiesTrimmedDescription === 0 ? value.studies.obibaListOptions.studiesTrimmedDescription : true;
        options.searchLayout = value.searchLayout ? value.searchLayout : options.searchLayout;
      }
      normalizeOptions();
    }

    function getOptions() {
      return angular.copy(options);
    }

    this.setOptions = setOptions;
    this.getOptions = getOptions;
  }

  /**
    * The Options service class.
    *
    * @param $q
    * @param $translate
    * @param optionsWrapper
    * @param ObibaServerConfigResource
    * @returns {{getLocale: getLocale, getOptionsAsyn: getOptionsAsyn, getOptions: getOptions, getDefaultListPageSize: getDefaultListPageSize}}
    * @constructor
    */
  function ObibaMicaSearchOptionsService($q, $translate, optionsWrapper, ObibaServerConfigResource) {

    var deferred = $q.defer();
    var resolved = false;

    /**
     * Resolves the option by retrieving the server config and overriding the corresponding options.
     * @returns {*}
     */
    function resolveOptions() {
      var ngClientOptions = optionsWrapper.getOptions();
      if (resolved) {
        // in case the getOptionsAsyn() is already called.
        return $q.when(optionsWrapper.getOptions());
      } else {
        ObibaServerConfigResource.get(function (micaConfig) {
          var hasMultipleNetworks = micaConfig.isNetworkEnabled && !micaConfig.isSingleNetworkEnabled;
          var hasMultipleStudies = !micaConfig.isSingleStudyEnabled || micaConfig.isHarmonizedDatasetEnabled;
          var hasMultipleDatasets = micaConfig.isCollectedDatasetEnabled || micaConfig.isHarmonizedDatasetEnabled;
          var updatedOptions = {
            searchLayout: micaConfig.searchLayout,
            locale: micaConfig.languages || $translate.use(),
            showSearchRefreshButton: true,
            networks: {
              showSearchTab: hasMultipleNetworks,
              networksColumn: {
                showNetworksStudyDatasetColumn: (hasMultipleDatasets && micaConfig.isCollectedDatasetEnabled) === false ? false : ngClientOptions.networks.networksColumn.showNetworksStudyDatasetColumn,
                showNetworksHarmonizationDatasetColumn: (hasMultipleDatasets && micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.networks.networksColumn.showNetworksHarmonizationDatasetColumn,
                showNetworksVariablesColumn: hasMultipleDatasets && ngClientOptions.networks.networksColumn.showNetworksVariablesColumn,
                showNetworksStudyVariablesColumn: (hasMultipleDatasets && micaConfig.isCollectedDatasetEnabled) === false ? false : ngClientOptions.networks.networksColumn.showNetworksStudyVariablesColumn,
                showNetworksDataschemaVariablesColumn: (hasMultipleDatasets && micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.networks.networksColumn.showNetworksDataschemaVariablesColumn
              }
            },
            studies: {
              showSearchTab: hasMultipleStudies,
              studiesColumn: {
                showStudiesTypeColumn: (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.studies.studiesColumn.showStudiesTypeColumn,
                showStudiesNetworksColumn: hasMultipleNetworks && ngClientOptions.studies.studiesColumn.showStudiesNetworksColumn,
                showStudiesVariablesColumn: hasMultipleDatasets && ngClientOptions.studies.studiesColumn.showStudiesVariablesColumn,
                showStudiesStudyDatasetsColumn: (hasMultipleDatasets && micaConfig.isCollectedDatasetEnabled) === false ? false : ngClientOptions.studies.studiesColumn.showStudiesStudyDatasetsColumn,
                showStudiesStudyVariablesColumn: (hasMultipleDatasets && micaConfig.isCollectedDatasetEnabled) === false ? false : ngClientOptions.studies.studiesColumn.showStudiesStudyVariablesColumn,
                showStudiesHarmonizationDatasetsColumn: (hasMultipleDatasets && micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.studies.studiesColumn.showStudiesHarmonizationDatasetsColumn,
                showStudiesDataschemaVariablesColumn: (hasMultipleDatasets && micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.studies.studiesColumn.showStudiesDataschemaVariablesColumn
              }
            },
            datasets: {
              showSearchTab: hasMultipleDatasets,
              datasetsColumn: {
                showDatasetsTypeColumn: micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled,
                showDatasetsNetworkColumn: hasMultipleNetworks && ngClientOptions.datasets.datasetsColumn.showDatasetsNetworkColumn,
                showDatasetsStudiesColumn: hasMultipleStudies && ngClientOptions.datasets.datasetsColumn.showDatasetsStudiesColumn,
                showDatasetsVariablesColumn: ngClientOptions.datasets.datasetsColumn.showDatasetsVariablesColumn
              }
            },
            variables: {
              showSearchTab: hasMultipleDatasets,
              variablesColumn: {
                showVariablesTypeColumn: (micaConfig.isCollectedDatasetEnabled && micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.variables.variablesColumn.showVariablesTypeColumn,
                showVariablesStudiesColumn: hasMultipleStudies && ngClientOptions.variables.variablesColumn.showVariablesStudiesColumn,
                showVariablesDatasetsColumn: (micaConfig.isCollectedDatasetEnabled || micaConfig.isHarmonizedDatasetEnabled) === false ? false : ngClientOptions.variables.variablesColumn.showVariablesDatasetsColumn
              }
            }
          };

          optionsWrapper.setOptions(updatedOptions);
          deferred.resolve(optionsWrapper.getOptions());
          resolved = true;
        });
        return deferred.promise;
      }
    }

    return {

      /**
       * This is the actual method to be called as it will override the defaults by server settings such as single Study
       * or Network configs.
       * @returns A promise that the client can use to retrieve the resolved options.
       */
      getOptionsAsyn: function () {
        return resolveOptions();
      },

      /**
       * Returns the options and if getOptionsAsyn() has never been called, the default options will be returned.
       * @returns {*}
       */
      getOptions: function () {
        return optionsWrapper.getOptions();
      },

      getDefaultListPageSize: function (target) {
        var options = optionsWrapper.getOptions();
        switch (target) {
          case QUERY_TARGETS.VARIABLE:
            return options.variables.listPageSize;
          case QUERY_TARGETS.DATASET:
            return options.datasets.listPageSize;
          case QUERY_TARGETS.STUDY:
            return options.studies.listPageSize;
          case QUERY_TARGETS.NETWORK:
            return options.networks.listPageSize;
        }
        return 20;
      }

    };
  }

  ngObibaMica.search
    .config(['$provide', function ($provide) {
      $provide.provider('ngObibaMicaSearch', function () {
        var optionsWrapper = new NgObibaMicaSearchOptionsWrapper();

        function initialize(options) {
          optionsWrapper.setOptions(options);
        }

        this.initialize = initialize;
        this.$get = ['$q', '$translate', 'ObibaServerConfigResource',
          function ($q, $translate, ObibaServerConfigResource) {
            return new ObibaMicaSearchOptionsService($q, $translate, optionsWrapper, ObibaServerConfigResource);
          }];
      });
    }]);
})();
