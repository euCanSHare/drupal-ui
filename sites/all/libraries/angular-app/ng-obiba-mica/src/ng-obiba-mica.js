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

var ngObibaMica;

/* exported NgObibaMicaTemplateUrlFactory */
function NgObibaMicaTemplateUrlFactory() {
  var templates = {
    'searchStudiesResultTable': 'search/components/result/studies-result-table/component.html',
    'searchNetworksResultTable': 'search/components/result/networks-result-table/component.html',
    'searchDatasetsResultTable': 'search/components/result/datasets-result-table/component.html',
    'searchCriteriaRegionTemplate': 'search/components/criteria/item-region/region/component.html',
    'vocabularyFilterDetailHeading': 'search/components/vocabulary-filter-detail-heading/component.html',
    'CriterionDropdownTemplate': 'search/components/criteria/item-region/dropdown/component.html',
    'searchResultList': 'search/components/result/search-result/list.html',
    'searchInputList': 'lists/views/input-search-widget/input-search-widget-template.html',
    'searchResultCoverage': 'search/components/result/search-result/coverage.html',
    'searchResultGraphics': 'search/components/result/search-result/graphics.html',
    'variableCrosstab': 'analysis/crosstab/views/crosstab-variable-crosstab.html',
    'variableFrequencies': 'analysis/crosstab/views/crosstab-variable-frequencies.html',
    'variableFrequenciesEmpty': 'analysis/crosstab/views/crosstab-variable-frequencies-empty.html',
    'variableStatistics': 'analysis/crosstab/views/crosstab-variable-statistics.html',
    'variableStatisticsEmpty': 'analysis/crosstab/views/crosstab-variable-statistics-empty.html',
    'searchCellStatValue': 'search/components/result/cell-stat-value/component.html',
    'graphicTableDirectiveTemplate': 'graphics/views/tables-directive.html'
  };
  var factory = { registry: null };

  function TemplateUrlProvider(registry) {
    var urlRegistry = registry;

    this.getHeaderUrl = function (key) {
      if (key in urlRegistry) {
        return urlRegistry[key].header;
      }

      return null;
    };

    this.getFooterUrl = function (key) {
      if (key in urlRegistry) {
        return urlRegistry[key].footer;
      }

      return null;
    };

    this.getTemplateUrl = function (key) {
      if (key in urlRegistry) {
        return urlRegistry[key].template ? urlRegistry[key].template : templates[key];
      }

      return null;
    };
  }

  factory.setTemplateUrl = function (key, url) {
    if (key in this.registry) {
      this.registry[key].template = url;
    }
  };

  factory.setHeaderUrl = function (key, url) {
    if (key in this.registry) {
      this.registry[key].header = url;
    }
  };

  factory.setFooterUrl = function (key, url) {
    if (key in this.registry) {
      this.registry[key].footer = url;
    }
  };

  factory.$get = function () {
    return new TemplateUrlProvider(this.registry);
  };

  this.create = function (inputRegistry) {
    factory.registry = inputRegistry;
    return factory;
  };
}

  (function () {
    ngObibaMica = angular.module('ngObibaMica', [
      'schemaForm',
      'ngCookies',
      'obiba.mica.utils',
      'obiba.mica.file',
      'obiba.mica.attachment',
      'obiba.mica.access',
      'obiba.mica.search',
      'obiba.mica.analysis',
      'obiba.mica.sets',
      'obiba.mica.graphics',
      'obiba.mica.localized',
      'obiba.mica.fileBrowser',
      'angularUtils.directives.dirPagination'
    ]);

    function ServerConfigResourceProvider () {
      var provider = this;

      function setFactory(value) {
        provider.$get = value;
      }

      /**
       * Default
       */
      provider.$get = function () {
        throw new Error('The provider factory method $get() must be overridden by client code.');
      };

      /**
       * Clients can override the $get() method to provide their MicaConfigResource object.
       * @type {setFactory}
       */
      provider.setFactory = setFactory;
    }

    function NgObibaMicaUrlProvider() {
      var registry = {
        'DataAccessClientDetailPath': '',
        'DataAccessClientListPath': '',
        'DataAccessFormConfigResource': 'ws/config/data-access-form',
        'DataAccessAmendmentFormConfigResource': 'ws/config/data-access-amendment-form',
        'DataAccessRequestsResource': 'ws/data-access-requests',
        'DataAccessAmendmentsResource': 'ws/data-access-request/:parentId/amendments',
        'DataAccessAmendmentResource': 'ws/data-access-request/:parentId/amendment/:id',
        'DataAccessRequestsExportHistoryResource': 'ws/data-access-requests/_history?lang=:lang',
        'DataAccessRequestsExportCsvResource': 'ws/data-access-requests/csv?lang=:lang',
        'DataAccessRequestResource': 'ws/data-access-request/:id',
        'DataAccessRequestStartDateResource': 'ws/data-access-request/:id/_start-date?date=:date',
        'DataAccessRequestActionLogsResource': 'ws/data-access-request/:id/_log-actions',
        'DataAccessAmendmentsLogHistoryResource': 'ws/data-access-request/:id/amendments/_history',
        'DataAccessRequestAttachmentsUpdateResource': 'ws/data-access-request/:id/_attachments',
        'DataAccessRequestAttachmentDownloadResource': 'ws/data-access-request/:id/attachments/:attachmentId/_download',
        'SchemaFormAttachmentDownloadResource': '/ws/:path/form/attachments/:attachmentName/:attachmentId/_download',
        'DataAccessRequestDownloadPdfResource': '/ws/data-access-request/:id/_pdf',
        'DataAccessRequestCommentsResource': 'ws/data-access-request/:id/comments?admin=:admin',
        'DataAccessRequestCommentResource': 'ws/data-access-request/:id/comment/:commentId',
        'DataAccessRequestStatusResource': 'ws/data-access-request/:id/_status?to=:status',
        'DataAccessAmendmentStatusResource': 'ws/data-access-request/:parentId/amendment/:id/_status?to=:status',
        'TempFileUploadResource': 'ws/files/temp',
        'TempFileResource': 'ws/files/temp/:id',
        'TaxonomiesSearchResource': 'ws/taxonomies/_search',
        'TaxonomiesResource': 'ws/taxonomies/_filter',
        'TaxonomyResource': 'ws/taxonomy/:taxonomy/_filter',
        'VocabularyResource': 'ws/taxonomy/:taxonomy/vocabulary/:vocabulary/_filter',
        'VariableResource': 'ws/variable/:id',
        'VariableSummaryResource': 'ws/variable/:id/summary',
        'CartPage': '#/cart',
        'SetsPage': '#/sets',
        'SetsResource': 'ws/:type/sets',
        'SetsImportResource': 'ws/:type/sets/_import',
        'SetResource': 'ws/:type/set/:id',
        'SetClearResource': 'ws/:type/set/:id/documents',
        'SetDocumentsResource': 'ws/:type/set/:id/documents?from=:from&limit=:limit',
        'SetExistsResource': 'ws/:type/set/:id/document/:did/_exists',
        'SetImportResource': 'ws/:type/set/:id/documents/_import',
        'SetImportQueryResource': 'ws/:type/set/:id/documents/_rql',
        'SetRemoveResource': 'ws/:type/set/:id/documents/_delete',
        'SetOpalExportResource': 'ws/:type/set/:id/documents/_opal',
        'JoinQuerySearchResource': 'ws/:type/_rql',
        'JoinQuerySearchCsvResource': 'ws/:type/_rql_csv?query=:query',
        'JoinQuerySearchCsvReportResource': 'ws/:type/_report?query=:query',
        'JoinQuerySearchCsvReportByNetworkResource': 'ws/:type/_report_by_network?networkId=:networkId&locale=:locale',
        'JoinQueryCoverageResource': 'ws/variables/_coverage',
        'JoinQueryCoverageDownloadResource': 'ws/variables/_coverage_download?query=:query',
        'VariablePage': '',
        'NetworkPage': '#/network/:network',
        'StudyPage': '#/:type/:study',
        'StudyPopulationsPage': '#/:type/:study',
        'StudyDcePage': '#/:type/:study/dce-id-:dce',
        'DatasetPage': '#/:type/:dataset',
        'BaseUrl': '',
        'FileBrowserFileResource': 'ws/file/:path/',
        'FileBrowserSearchResource': 'ws/files-search/:path',
        'FileBrowserDownloadUrl': 'ws/draft/file-dl/:path?inline=:inline',
        'SearchBaseUrl': '#/search',
        'DocumentSuggestion': 'ws/:documentType/_suggest',
        'EntitiesCountResource': 'ws/datasets/entities/_count?query=:query',
        'EntitiesCountBaseUrl': '#/entities-count',
        'DatasetCategoricalVariablesResource': 'ws/:dsType/:dsId/variables/:query/categorical',
        'DatasetVariablesResource': 'ws/:dsType/:dsId/variables/:query',
        'DatasetVariableResource': 'ws/variable/:varId',
        'DatasetVariablesCrosstabResource': 'ws/:dsType/:dsId/variables/cross/:v1/by/:v2',
        'DatasetResource': 'ws/dataset/:dsType/:dsId',
      };

      function UrlProvider(registry) {
        var urlRegistry = registry;

        this.getUrl = function (resource) {
          if (resource in urlRegistry) {
            return urlRegistry[resource];
          }

          return null;
        };
      }

      this.setUrl = function (key, url) {
        if (key in registry) {
          registry[key] = url;
        }
      };

      this.$get = function () {
        return new UrlProvider(registry);
      };
    }

    ngObibaMica
      .constant('USER_ROLES', {
        all: '*',
        admin: 'mica-administrator',
        reviewer: 'mica-reviewer',
        editor: 'mica-editor',
        user: 'mica-user',
        dao: 'mica-data-access-officer'
      })
      .config(['$provide', 'paginationTemplateProvider', function ($provide, paginationTemplateProvider) {
        $provide.provider('ngObibaMicaUrl', NgObibaMicaUrlProvider);
        $provide.provider('ObibaServerConfigResource', ServerConfigResourceProvider);
        paginationTemplateProvider.setPath('views/pagination-template.html');
      }]);

  })();