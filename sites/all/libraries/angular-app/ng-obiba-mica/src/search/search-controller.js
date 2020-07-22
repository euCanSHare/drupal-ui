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
/* global QUERY_TYPES */
/* global BUCKET_TYPES */
/* global RQL_NODE */
/* global DISPLAY_TYPES */
/* global CriteriaIdGenerator */
/* global SORT_FIELDS */

/* exported QUERY_GROWL_EVENT */
var QUERY_GROWL_EVENT = 'query.growl-event';

(function () {
  function manageSearchHelpText($scope, $translate, $cookies) {
    var cookiesSearchHelp = 'micaHideSearchHelpText';
    var cookiesClassificationHelp = 'micaHideClassificationHelpBox';

    $translate(['search.help', 'search.coverage-help'])
      .then(function (translation) {
        if (!$scope.options.SearchHelpText && !$cookies.get(cookiesSearchHelp)) {
          $scope.options.SearchHelpText = translation['search.help'];
        }
        if (!$scope.options.ClassificationHelpText && !$cookies.get(cookiesClassificationHelp)) {
          $scope.options.ClassificationHelpText = translation['classifications.help'];
        }
      });

    // Close the Help search box and set the local cookies
    $scope.closeHelpBox = function () {
      $cookies.put(cookiesSearchHelp, true);
      $scope.options.SearchHelpText = null;
    };

    // Close the Help classification box and set the local cookies
    $scope.closeClassificationHelpBox = function () {
      $cookies.put(cookiesClassificationHelp, true);
      $scope.options.ClassificationHelpText = null;
    };

    // Retrieve from local cookies if user has disabled the Help Search Box and hide the box if true
    if ($cookies.get(cookiesSearchHelp)) {
      $scope.options.SearchHelpText = null;
    }

    // Retrieve from local cookies if user has disabled the Help Classification Box and hide the box if true
    if ($cookies.get(cookiesClassificationHelp)) {
      $scope.options.ClassificationHelpText = null;
    }
  }

  ngObibaMica.search
    .controller('SearchController', ['$timeout',
      '$scope',
      '$rootScope',
      '$location',
      '$translate',
      '$filter',
      '$cookies',
      'ngObibaMicaSearchTemplateUrl',
      'ObibaServerConfigResource',
      'JoinQuerySearchResource',
      'JoinQueryCoverageResource',
      'AlertService',
      'ServerErrorUtils',
      'LocalizedValues',
      'RqlQueryService',
      'RqlQueryUtils',
      'SearchContext',
      'CoverageGroupByService',
      'VocabularyService',
      'EntitySuggestionRqlUtilityService',
      'SearchControllerFacetHelperService',
      'options',
      'PaginationService',
      function ($timeout, $scope,
        $rootScope,
        $location,
        $translate,
        $filter,
        $cookies,
        ngObibaMicaSearchTemplateUrl,
        ObibaServerConfigResource,
        JoinQuerySearchResource,
        JoinQueryCoverageResource,
        AlertService,
        ServerErrorUtils,
        LocalizedValues,
        RqlQueryService,
        RqlQueryUtils,
        SearchContext,
        CoverageGroupByService,
        VocabularyService,
        EntitySuggestionRqlUtilityService,
        SearchControllerFacetHelperService,
        options,
        PaginationService) {

        $scope.options = options;
        manageSearchHelpText($scope, $translate, $cookies);

        $scope.taxonomyTypeMap = { //backwards compatibility for pluralized naming in configs.
          variable: 'variables',
          study: 'studies',
          network: 'networks',
          dataset: 'datasets'
        };

        $translate(['search.classifications-title', 'search.classifications-link', 'search.faceted-navigation-help'])
          .then(function (translation) {
            $scope.hasClassificationsTitle = translation['search.classifications-title'];
            $scope.hasClassificationsLinkLabel = translation['search.classifications-link'];
            $scope.hasFacetedNavigationHelp = translation['search.faceted-navigation-help'];
          });

        var searchTaxonomyDisplay = {
          variable: $scope.options.variables.showSearchTab,
          dataset: $scope.options.datasets.showSearchTab,
          study: $scope.options.studies.showSearchTab,
          network: $scope.options.networks.showSearchTab
        };

        var taxonomyTypeInverseMap = Object.keys($scope.taxonomyTypeMap).reduce(function (prev, k) {
          prev[$scope.taxonomyTypeMap[k]] = k;
          return prev;
        }, {});

        $scope.lang = $translate.use();

        function initSearchTabs() {
          function getTabsOrderParam(arg) {
            var value = $location.search()[arg];

            return value && value.split(',')
              .filter(function (t) {
                return t;
              })
              .map(function (t) {
                return t.trim();
              });
          }

          var targetTabsOrderParam = getTabsOrderParam('targetTabsOrder');
          $scope.targetTabsOrder = (targetTabsOrderParam || $scope.options.targetTabsOrder).filter(function (t) {
            return searchTaxonomyDisplay[t];
          });

          var searchTabsOrderParam = getTabsOrderParam('searchTabsOrder');
          $scope.searchTabsOrder = searchTabsOrderParam || $scope.options.searchTabsOrder;

          var resultTabsOrderParam = getTabsOrderParam('resultTabsOrder');
          $scope.resultTabsOrder = (resultTabsOrderParam || $scope.options.resultTabsOrder).filter(function (t) {
            return searchTaxonomyDisplay[t];
          });

          if ($location.search().target) {
            $scope.target = $location.search().target;
          } else if (!$scope.target) {
            $scope.target = $scope.targetTabsOrder[0];
          }
        }

        function onError(response) {
          $scope.search.result = {};
          $scope.search.loading = false;
          AlertService.alert({
            id: 'SearchController',
            type: 'danger',
            msg: ServerErrorUtils.buildMessage(response),
            delay: 5000
          });
        }

        function canExecuteWithEmptyQuery() {
          return $scope.search.layout === 'layout2' || $scope.search.query;
        }

        function validateType(type) {
          if (!type || !QUERY_TYPES[type.toUpperCase()]) {
            throw new Error('Invalid type: ' + type);
          }
        }

        function validateBucket(bucket) {
          if (bucket &&
            (!BUCKET_TYPES[bucket.replace('-', '_').toUpperCase()] || !CoverageGroupByService.canGroupBy(bucket))) {
            throw new Error('Invalid bucket ' + bucket);
          }
        }

        function validateDisplay(display) {
          if (!display || !DISPLAY_TYPES[display.toUpperCase()]) {
            throw new Error('Invalid display: ' + display);
          }
        }

        function getDefaultQueryType() {
          return $scope.taxonomyTypeMap[$scope.resultTabsOrder[0]];
        }

        function getDefaultDisplayType() {
          return $scope.searchTabsOrder[0] || DISPLAY_TYPES.LIST;
        }

        function resolveLayout(resolvedOptions) {
          return resolvedOptions.listLayout ? resolvedOptions.listLayout :
            resolvedOptions.searchLayout ? resolvedOptions.searchLayout : 'layout2';
        }

        function validateQueryData() {
          try {
            var search = $location.search();
            var type = $scope.resultTabsOrder.indexOf(taxonomyTypeInverseMap[search.type]) > -1 ? search.type : getDefaultQueryType();
            var bucket = search.bucket && CoverageGroupByService.canGroupBy(search.bucket) ? search.bucket : CoverageGroupByService.defaultBucket();
            var display = $scope.searchTabsOrder.indexOf(search.display) > -1 ? search.display : getDefaultDisplayType();
            var query = search.query || '';
            validateType(type);
            validateBucket(bucket);
            validateDisplay(display);
            $scope.search.type = type;
            $scope.search.withZeros = search.withZeros ? search.withZeros : true;
            $scope.search.bucket = bucket;
            $scope.search.display = display;
            $scope.search.query = query;
            $scope.search.rqlQuery = RqlQueryService.parseQuery(query);

            $scope.search.layout = setLayout(search.layout ? search.layout : resolveLayout($scope.options));

            return true;
          } catch (e) {
            AlertService.alert({
              id: 'SearchController',
              type: 'danger',
              msg: e.message,
              delay: 5000
            });
          }

          return false;
        }

        function setLayout(layout) {
          return layout ? (['layout1', 'layout2'].indexOf(layout) > -1 ? layout : 'layout2') : 'layout2';
        }

        var clearSearchQuery = function () {
          var search = $location.search();
          delete search.query;
          $location.search(search);
        };

        var toggleSearchQuery = function () {
          $scope.search.advanced = !$scope.search.advanced;
        };

        var showAdvanced = function () {
          var children = $scope.search.criteria.children || [];
          for (var i = children.length; i--;) {
            var vocabularyChildren = children[i].children || [];
            for (var j = vocabularyChildren.length; j--;) {
              if (vocabularyChildren[j].type === RQL_NODE.OR || vocabularyChildren[j].type === RQL_NODE.AND) {
                return true;
              }
            }
          }
        };

        function sortCriteriaItems(items) {
          items.sort(function (a, b) {
            if (a.target === 'network' || b.target === 'variable') {
              return -1;
            }
            if (a.target === 'variable' || b.target === 'network') {
              return 1;
            }
            if (a.target < b.target) {
              return 1;
            }
            if (a.target > b.target) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
        }

        function loadResults() {
          // execute search only when results are to be shown
          if ($location.path() !== '/search') {
            return;
          }

          function updateSortByType() {
            var rqlSort = RqlQueryService.getTargetQuerySort($scope.search.type, $scope.search.rqlQuery);
            var sort = rqlSort && rqlSort.args ? rqlSort.args : null;

            if (!sort) {
              sort = $scope.search.type === QUERY_TYPES.VARIABLES ? SORT_FIELDS.NAME : SORT_FIELDS.ACRONYM;

              if ($scope.search.type === QUERY_TYPES.VARIABLES) {
                sort = [SORT_FIELDS.VARIABLE_TYPE, SORT_FIELDS.CONTAINER_ID, SORT_FIELDS.POPULATION_WEIGHT, SORT_FIELDS.DATA_COLLECTION_EVENT_WEIGHT, SORT_FIELDS.DATASET_ID, SORT_FIELDS.INDEX, SORT_FIELDS.NAME];
              } else if ($scope.search.type === QUERY_TYPES.DATASETS) {
                sort = [SORT_FIELDS.STUDY_TABLE.STUDY_ID, SORT_FIELDS.STUDY_TABLE.POPULATION_WEIGHT, SORT_FIELDS.STUDY_TABLE.DATA_COLLECTION_EVENT_WEIGHT, SORT_FIELDS.ACRONYM];
              }
            }

            return sort;
          }

          var localizedQuery =
            RqlQueryService.prepareSearchQueryAndSerialize(
              $scope.search.display,
              $scope.search.type,
              $scope.search.rqlQuery,
              $scope.lang,
              updateSortByType()
            );

          function getCountResultFromJoinQuerySearchResponse(response) {
            return {
              studyTotalCount: {
                total: response.studyResultDto.totalCount,
                hits: response.studyResultDto.totalHits
              },
              datasetTotalCount: {
                total: response.datasetResultDto.totalCount,
                hits: response.datasetResultDto.totalHits
              },
              variableTotalCount: {
                total: response.variableResultDto.totalCount,
                hits: response.variableResultDto.totalHits
              },
              networkTotalCount: {
                total: response.networkResultDto.totalCount,
                hits: response.networkResultDto.totalHits
              }
            };
          }

          switch ($scope.search.display) {
            case DISPLAY_TYPES.LIST:
              $scope.search.loading = true;
              $scope.search.executedQuery = localizedQuery;
              JoinQuerySearchResource[$scope.search.type]({ query: localizedQuery },
                function onSuccess(response) {
                  $scope.search.result.list = response;
                  $scope.search.loading = false;
                  $scope.search.countResult = getCountResultFromJoinQuerySearchResponse(response);
                  $timeout(function() {
                    var pagination = RqlQueryService.getQueryPaginations($scope.search.rqlQuery);
                    PaginationService.update(pagination, $scope.search.countResult);
                  });
                },
                onError);
              break;
            case DISPLAY_TYPES.COVERAGE:
              var hasVariableCriteria = Object.keys($scope.search.criteriaItemMap).map(function (k) {
                return $scope.search.criteriaItemMap[k];
              }).filter(function (item) {
                return QUERY_TARGETS.VARIABLE === item.getTarget() && item.taxonomy.name !== 'Mica_variable';
              }).length > 0;

              if (hasVariableCriteria) {
                $scope.search.loading = true;
                $scope.search.executedQuery = RqlQueryService.prepareCoverageQuery(localizedQuery, $scope.search.bucket);
                JoinQueryCoverageResource.get({ query: $scope.search.executedQuery, withZeros: $scope.search.withZeros },
                  function onSuccess(response) {
                    $scope.search.result.coverage = response;
                    $scope.search.loading = false;
                    $scope.search.countResult = response.totalCounts;
                  },
                  onError);
              } else {
                $scope.search.result = {};
              }

              break;
            case DISPLAY_TYPES.GRAPHICS:
              $scope.search.loading = true;
              $scope.search.executedQuery = RqlQueryService.prepareGraphicsQuery(localizedQuery,
                ['Mica_study.populations-selectionCriteria-countriesIso', 'Mica_study.populations-dataCollectionEvents-bioSamples', 'Mica_study.numberOfParticipants-participant-number'],
                ['Mica_study.methods-design', 'Mica_study.start-range', 'Mica_study.numberOfParticipants-participant-number'], true);
              JoinQuerySearchResource.studies({ query: $scope.search.executedQuery },
                function onSuccess(response) {
                  $scope.search.result.graphics = response;
                  $scope.search.loading = false;
                  $scope.search.countResult = getCountResultFromJoinQuerySearchResponse(response);
                },
                onError);
              break;
          }

        }

        function findAndSetCriteriaItemForTaxonomyVocabularies(target, taxonomy) {
          if (Array.isArray(taxonomy)) {
            taxonomy.forEach(function (subTaxonomy) {
              subTaxonomy.vocabularies.forEach(function (taxonomyVocabulary) {
                taxonomyVocabulary.existingItem =
                  RqlQueryService.findCriteriaItemFromTreeById(target,
                    CriteriaIdGenerator.generate(subTaxonomy, taxonomyVocabulary), $scope.search.criteria, true);
              });
            });
          } else {
            taxonomy.vocabularies.forEach(function (taxonomyVocabulary) {
              taxonomyVocabulary.existingItem =
                RqlQueryService.findCriteriaItemFromTreeById(target,
                  CriteriaIdGenerator.generate(taxonomy, taxonomyVocabulary), $scope.search.criteria, true);
            });
          }
        }

        function executeSearchQuery() {
          if (validateQueryData()) {
            // build the criteria UI
            RqlQueryService.createCriteria($scope.search.rqlQuery, $scope.lang).then(function (result) {
              // criteria UI is updated here
              $scope.search.criteria = result.root;

              if ($scope.search.criteria && $scope.search.criteria.children) {
                sortCriteriaItems($scope.search.criteria.children);
              }

              $scope.search.criteriaItemMap = result.map;

              if (canExecuteWithEmptyQuery()) {
                loadResults();
              }

              if ($scope.search.selectedTarget && $scope.search.selectedTaxonomy) {
                findAndSetCriteriaItemForTaxonomyVocabularies($scope.search.selectedTarget, $scope.search.selectedTaxonomy);
              }

              $scope.$broadcast('ngObibaMicaQueryUpdated', $scope.search.criteria);
            });
          }
        }

        function processTaxonomyVocabulary(target, taxonomy, taxonomyVocabulary) {
          function processExistingItem(existingItem) {
            if (existingItem) {
              if (VocabularyService.isNumericVocabulary(taxonomyVocabulary)) {
                taxonomyVocabulary.rangeTerms = existingItem.getRangeTerms();
              }

              if (VocabularyService.isMatchVocabulary(taxonomyVocabulary)) {
                taxonomyVocabulary.matchString = existingItem.selectedTerms.join('');
              }

              // when vocabulary has terms
              taxonomyVocabulary.wholeVocabularyIsSelected = ['exists', 'match'].indexOf(existingItem.type) > -1;
              (taxonomyVocabulary.terms || []).forEach(function (term) {
                term.selected = existingItem.type === 'exists' || existingItem.selectedTerms.indexOf(term.name) > -1;
              });
            } else {
              taxonomyVocabulary.rangeTerms = {};
              taxonomyVocabulary.matchString = null;

              // when vocabulary has terms
              taxonomyVocabulary.wholeVocabularyIsSelected = false;
              (taxonomyVocabulary.terms || []).forEach(function (term) {
                term.selected = false;
              });
            }

            taxonomyVocabulary._existingItem = existingItem;
          }

          taxonomyVocabulary.__defineSetter__('existingItem', processExistingItem);
          taxonomyVocabulary.__defineGetter__('existingItem', function () { return taxonomyVocabulary._existingItem; });

          taxonomyVocabulary.existingItem =
            RqlQueryService.findCriteriaItemFromTreeById(target,
              CriteriaIdGenerator.generate(taxonomy, taxonomyVocabulary), $scope.search.criteria, true);
        }

        function toggleLeftPanelVisibility(visible) {
          $scope.showLeftPanel = visible;
        }

        function onTaxonomyFilterPanelToggleVisibility(target, taxonomy) {
          if (target && taxonomy) {
            if (Array.isArray(taxonomy)) {
              taxonomy.forEach(function (subTaxonomy) {
                subTaxonomy.vocabularies.forEach(function (taxonomyVocabulary) {
                  processTaxonomyVocabulary(target, subTaxonomy, taxonomyVocabulary);
                });
              });
            } else {
              taxonomy.vocabularies.forEach(function (taxonomyVocabulary) {
                processTaxonomyVocabulary(target, taxonomy, taxonomyVocabulary);
              });
            }
          }

          $scope.search.selectedTarget = target;
          $scope.search.selectedTaxonomy = taxonomy;
          $scope.search.showTaxonomyPanel = taxonomy !== null;

          // QUICKFIX for MK-1772 - there is a digest desync and UI misses info, resend the request upon closing
          // A good solution may be a RequestQueue.
          if (!$scope.search.showTaxonomyPanel) {
            loadResults();
          }
        }

        $rootScope.$on('$translateChangeSuccess', function (event, value) {
          if (value.language !== SearchContext.currentLocale()) {
            $scope.lang = $translate.use();
            SearchContext.setLocale($scope.lang);
            executeSearchQuery();
          }
        });


        /**
         * Updates the URL location triggering a query execution
         */
        var refreshQuery = function () {
          var query = new RqlQuery().serializeArgs($scope.search.rqlQuery.args);
          var search = $location.search();
          if ('' === query) {
            delete search.query;
          } else {
            search.query = query;
          }
          $location.search(search);
        };

        /**
         * Updates the URL location without triggering a query execution
         */
        var replaceQuery = function () {
          var query = new RqlQuery().serializeArgs($scope.search.rqlQuery.args);
          var search = $location.search();
          if ('' === query) {
            delete search.query;
          } else {
            search.query = query;
          }
          $location.search(search).replace();
        };

        /**
         * Removes the item from the criteria tree
         * @param item
         */
        var removeCriteriaItem = function (item) {
          RqlQueryService.removeCriteriaItem(item);
          refreshQuery();
        };

        /**
         * Propagates a Scope change that results in criteria panel update
         * @param item
         */
        var selectCriteria = function (item, logicalOp, replace, showNotification, fullCoverage) {
          if (angular.isUndefined(showNotification)) {
            showNotification = true;
          }

          if (item.id) {
            var id = CriteriaIdGenerator.generate(item.taxonomy, item.vocabulary);
            var existingItem = RqlQueryService.findCriteriaItemFromTree(item, $scope.search.criteria);
            var growlMsgKey;

            if (existingItem && id.indexOf('dceId') !== -1 && fullCoverage) {
              removeCriteriaItem(existingItem);
              growlMsgKey = 'search.criterion.updated';
              RqlQueryService.addCriteriaItem($scope.search.rqlQuery, item, logicalOp);
            } else if (existingItem) {
              growlMsgKey = 'search.criterion.updated';
              RqlQueryService.updateCriteriaItem(existingItem, item, replace);
            } else {
              growlMsgKey = 'search.criterion.created';
              RqlQueryService.addCriteriaItem($scope.search.rqlQuery, item, logicalOp);
            }

            if (showNotification) {
              $scope.$broadcast(QUERY_GROWL_EVENT, item.vocabulary.title, $scope.lang, item.target, growlMsgKey);
            }

            refreshQuery();
          }
        };

        var onTypeChanged = function (type) {
          if (type) {
            validateType(type);
            var search = $location.search();
            search.type = type;
            search.display = DISPLAY_TYPES.LIST;
            $location.search(search);
          }
        };

        var onBucketChanged = function (bucket) {
          if (bucket) {
            validateBucket(bucket);
            var search = $location.search();
            search.bucket = bucket;
            $location.search(search);
          }
        };

        function onLocationChange (event, newLocation, oldLocation) {
          $scope.search.withZeros = $location.search().withZeros === undefined || $location.search().withZeros === 'true' ? true : false;

          if (newLocation !== oldLocation) {
            try {
              validateBucket($location.search().bucket);
              executeSearchQuery();
            } catch (error) {
              var defaultBucket = CoverageGroupByService.defaultBucket();
              $location.search('bucket', defaultBucket).replace();
            }
          }
        }

        var onPaginate = function (target, from, size, replace) {
          $scope.search.rqlQuery = $scope.search.rqlQuery || new RqlQueryUtils(RQL_NODE.AND);
          RqlQueryService.prepareQueryPagination($scope.search.rqlQuery, target, from, size);
          if (replace) {
            replaceQuery();
          } else {
            refreshQuery();
          }
        };

        var onDisplayChanged = function (display) {
          if (display) {
            validateDisplay(display);

            var search = $location.search();
            search.display = display;
            $location.search(search);
          }
        };

        var onUpdateCriteria = function (item, type, useCurrentDisplay, replaceTarget, showNotification, fullCoverage) {
          if (type) {
            onTypeChanged(type);
          }

          if (replaceTarget) {
            var criteriaItem = RqlQueryService.findCriteriaItemFromTree(item, $scope.search.criteria);
            if (criteriaItem) {
              ngObibaMica.search.CriteriaReducer.reduce(criteriaItem.parent, criteriaItem);
            }
          }

          onDisplayChanged(useCurrentDisplay && $scope.search.display ? $scope.search.display : DISPLAY_TYPES.LIST);
          selectCriteria(item, RQL_NODE.AND, true, showNotification, fullCoverage);
        };

        var onRemoveCriteria = function (item) {
          var found = RqlQueryService.findCriterion($scope.search.criteria, item.id);
          removeCriteriaItem(found);
        };

        var onSelectTerm = function (target, taxonomy, vocabulary, args) {
          args = args || {};

          if (args.text) {
            args.text = args.text.replace(/[^a-zA-Z0-9*" _-]/g, '');
          }

          if (angular.isString(args)) {
            args = { term: args };
          }

          if (vocabulary) {
            var item;
            if (VocabularyService.isNumericVocabulary(vocabulary)) {
              item = RqlQueryService.createCriteriaItem(target, taxonomy, vocabulary, null, $scope.lang);
              item.rqlQuery = RqlQueryUtils.buildRqlQuery(item);
              RqlQueryUtils.updateRangeQuery(item.rqlQuery, args.from, args.to);
              selectCriteria(item, null, true);

              return;
            } else if (VocabularyService.isMatchVocabulary(vocabulary)) {
              item = RqlQueryService.createCriteriaItem(target, taxonomy, vocabulary, null, $scope.lang);
              item.rqlQuery = RqlQueryUtils.buildRqlQuery(item);
              RqlQueryUtils.updateMatchQuery(item.rqlQuery, args.text);
              selectCriteria(item, null, true);

              return;
            }
          }

          if (options.searchLayout === 'layout1') {
            selectCriteria(RqlQueryService.createCriteriaItem(target, taxonomy, vocabulary, args && args.term, $scope.lang));
          } else {
            // TODO externalize TermsVocabularyFacetController.selectTerm and use it for terms case
            var selected = vocabulary.terms.filter(function (t) { return t.selected; }).map(function (t) { return t.name; }),
              criterion = RqlQueryService.findCriterion($scope.search.criteria, CriteriaIdGenerator.generate(taxonomy, vocabulary));

            if (criterion && args.term) {
              criterion.rqlQuery.name = RQL_NODE.IN;

              if (args.term.selected) {
                criterion.rqlQuery = RqlQueryUtils.mergeInQueryArgValues(criterion.rqlQuery, [args.term.name]);
              } else {
                var currentTerms = criterion.rqlQuery.args[1] || [];

                if (criterion.type === RQL_NODE.EXISTS) {
                  currentTerms = criterion.vocabulary.terms.map(function (term) {
                    return term.name;
                  });
                }

                var index = currentTerms.indexOf(args.term.name);

                currentTerms = Array.isArray(currentTerms) ? currentTerms : [currentTerms];

                if (index > -1) {
                  currentTerms.splice(index, 1);

                  if (currentTerms.length === 0) {
                    criterion.rqlQuery.name = RQL_NODE.EXISTS;
                  }
                } else {
                  currentTerms.push(args.term.name);
                }

                criterion.rqlQuery = RqlQueryUtils.mergeInQueryArgValues(criterion.rqlQuery, currentTerms);
              }

              if (vocabulary.terms.length > 1 && selected.length === vocabulary.terms.length) {
                criterion.rqlQuery.name = RQL_NODE.EXISTS;
                criterion.rqlQuery.args.pop();
              }

              $scope.$broadcast(QUERY_GROWL_EVENT, vocabulary.title, $scope.lang, target);

              $scope.refreshQuery();
            } else {
              var setExists = vocabulary.terms.length > 1 && selected.length === vocabulary.terms.length;
              selectCriteria(RqlQueryService.createCriteriaItem(target, taxonomy, vocabulary, !setExists && (args && args.term), $scope.lang));
            }
          }
        };

        var VIEW_MODES = {
          SEARCH: 'search',
          CLASSIFICATION: 'classification'
        };

        const SUGGESTION_FIELDS_MAP = new Map([
          [QUERY_TARGETS.NETWORK, ['acronym', 'name']],
          [QUERY_TARGETS.STUDY, ['acronym', 'name']],
          [QUERY_TARGETS.DATASET, ['acronym', 'name']],
          [QUERY_TARGETS.VARIABLE, ['name', 'label']]
        ]);

        function searchSuggestion(target, suggestion, withSpecificFields) {
          var rqlQuery = $scope.search.rqlQuery;
          var targetQuery = RqlQueryService.findTargetQuery(target, rqlQuery);

          if (!targetQuery) {
            targetQuery = new RqlQuery(target);
            rqlQuery.push(targetQuery);
          }

          // get filter fields
          var filterFields;
          if (withSpecificFields) {
            filterFields = SUGGESTION_FIELDS_MAP.get(target);
          }

          var matchQuery = EntitySuggestionRqlUtilityService.createMatchQuery(suggestion, filterFields);
          if (!matchQuery) {
            EntitySuggestionRqlUtilityService.removeFilteredMatchQueryFromTargetQuery(targetQuery);
          } else {
            var filterQuery = EntitySuggestionRqlUtilityService.givenTargetQueryGetFilterQuery(targetQuery);
            if (!filterQuery) {
              targetQuery.push(new RqlQuery(RQL_NODE.FILTER).push(matchQuery));
            } else {
              var currentMatchQuery = EntitySuggestionRqlUtilityService.givenFilterQueryGetMatchQuery(filterQuery);
              if (currentMatchQuery) {
                currentMatchQuery.args = matchQuery.args;
              } else {
                filterQuery.push(matchQuery);
              }
            }
          }

          refreshQuery();
        }

        $scope.searchSuggestion = searchSuggestion;
        $scope.goToSearch = function () {
          $scope.viewMode = VIEW_MODES.SEARCH;
          $location.search('taxonomy', null);
          $location.search('vocabulary', null);
          $location.search('target', null);
          $location.path('/search');
        };

        $scope.goToClassifications = function () {
          $scope.viewMode = VIEW_MODES.CLASSIFICATION;
          $location.path('/classifications');
          $location.search('target', $scope.targetTabsOrder[0]);
        };

        $scope.navigateToTarget = function (target) {
          $location.search('target', target);
          $location.search('taxonomy', null);
          $location.search('vocabulary', null);
          $scope.target = target;
        };

        $scope.QUERY_TYPES = QUERY_TYPES;
        $scope.BUCKET_TYPES = BUCKET_TYPES;

        $scope.search = {
          layout: 'layout2',
          query: null,
          advanced: false,
          rqlQuery: new RqlQuery(),
          executedQuery: null,
          type: null,
          bucket: null,
          withZeros: true,
          result: {
            list: null,
            coverage: null,
            graphics: null
          },
          criteria: [],
          criteriaItemMap: {},
          loading: false
        };

        $scope.$on(QUERY_GROWL_EVENT, function(event, vocabularyTitle, lang, target, msgKey) {
          msgKey = msgKey || 'search.criterion.updated';

          AlertService.growl({
            id: 'SearchControllerGrowl',
            type: 'info',
            msgKey: msgKey,
            msgArgs: [LocalizedValues.forLocale(vocabularyTitle, lang), $filter('translate')('taxonomy.target.' + target)],
            delay: 3000
          });
        });

        $scope.viewMode = VIEW_MODES.SEARCH;

        $scope.searchHeaderTemplateUrl = ngObibaMicaSearchTemplateUrl.getHeaderUrl('search');
        $scope.classificationsHeaderTemplateUrl = ngObibaMicaSearchTemplateUrl.getHeaderUrl('classifications');
        $scope.toggleLeftPanelVisibility = toggleLeftPanelVisibility;
        $scope.onTaxonomyFilterPanelToggleVisibility = onTaxonomyFilterPanelToggleVisibility;
        $scope.selectDisplay = onDisplayChanged;
        $scope.selectCriteria = selectCriteria;
        $scope.removeCriteriaItem = removeCriteriaItem;
        $scope.refreshQuery = refreshQuery;
        $scope.clearSearchQuery = clearSearchQuery;
        $scope.toggleSearchQuery = toggleSearchQuery;
        $scope.showAdvanced = showAdvanced;
        $scope.onTypeChanged = onTypeChanged;
        $scope.onBucketChanged = onBucketChanged;
        $scope.onDisplayChanged = onDisplayChanged;
        $scope.onUpdateCriteria = onUpdateCriteria;
        $scope.onRemoveCriteria = onRemoveCriteria;
        $scope.onSelectTerm = onSelectTerm;
        $scope.QUERY_TARGETS = QUERY_TARGETS;
        $scope.onPaginate = onPaginate;
        $scope.canExecuteWithEmptyQuery = canExecuteWithEmptyQuery;
        $scope.inSearchMode = function () {
          return $scope.viewMode === VIEW_MODES.SEARCH;
        };
        $scope.toggleFullscreen = function (fullscreen) {
          if ($scope.isFullscreen && $scope.isFullscreen !== fullscreen) {
            // in case the ESC key was pressed
            $timeout(function() {$scope.isFullscreen = fullscreen;});
          } else {
            $scope.isFullscreen = fullscreen;
          }
        };

        $scope.isFullscreen = false;
        $scope.isSearchAvailable = true;

        ObibaServerConfigResource.get(function (micaConfig) {
          $scope.isSearchAvailable = !micaConfig.isSingleStudyEnabled ||
            (micaConfig.isNetworkEnabled && !micaConfig.isSingleNetworkEnabled) ||
            micaConfig.isCollectedDatasetEnabled || micaConfig.isHarmonizedDatasetEnabled;
        });

        $scope.unbindLocationChange = $scope.$on('$locationChangeSuccess', onLocationChange);


        $rootScope.$on('ngObibaMicaSearch.sortChange', function (obj, sort) {
          $scope.search.rqlQuery = RqlQueryService.prepareSearchQueryNoFields(
            $scope.search.display,
            $scope.search.type,
            $scope.search.rqlQuery,
            $scope.lang,
            sort
          );
          refreshQuery();
        });

        $rootScope.$on('ngObibaMicaSearch.searchSuggestion', function (event, suggestion, target, withSpecificFields) {
          searchSuggestion(target, suggestion, withSpecificFields);
        });

        function init() {
          $scope.showLeftPanel = true;
          $scope.taxonomyNav = [];
          $scope.lang = $translate.use();
          SearchContext.setLocale($scope.lang);
          initSearchTabs();

          SearchControllerFacetHelperService.help($scope.targetTabsOrder, $scope.lang).then(function (data) {
            $scope.facetedTaxonomies = data.getFacetedTaxonomies();
            $scope.hasFacetedTaxonomies = data.getHasFacetedTaxonomies();
            $scope.targetTabsOrder = data.getTabOrderTodisplay();
            $scope.taxonomyNav = data.getTaxonomyNav();
          });

          executeSearchQuery();
        }

        init();
      }])

    .controller('ResultTabsOrderCountController', [function () {
    }]);
})();
