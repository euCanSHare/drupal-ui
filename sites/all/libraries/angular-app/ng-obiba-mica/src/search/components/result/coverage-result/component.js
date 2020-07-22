'use strict';

/* global BUCKET_TYPES */
/* global DISPLAY_TYPES */
/* global RowPopupState */

ngObibaMica.search
  .controller('CoverageResultTableController', [
    '$scope',
    '$location',
    '$q',
    '$translate',
    '$filter',
    'LocalizedValues',
    'PageUrlService',
    'RqlQueryUtils',
    'RqlQueryService',
    'CoverageGroupByService',
    'StudyFilterShortcutService',
    'TaxonomyService',
    'AlertService',
    'ngObibaMicaSearch',
    function ($scope,
      $location,
      $q,
      $translate,
      $filter,
      LocalizedValues,
      PageUrlService,
      RqlQueryUtils,
      RqlQueryService,
      CoverageGroupByService,
      StudyFilterShortcutService,
      TaxonomyService,
      AlertService,
      ngObibaMicaSearch) {
      var targetMap = {}, vocabulariesTermsMap = {};
      var rowPopupState = new RowPopupState();

      targetMap[BUCKET_TYPES.NETWORK] = QUERY_TARGETS.NETWORK;
      targetMap[BUCKET_TYPES.STUDY] = QUERY_TARGETS.STUDY;
      targetMap[BUCKET_TYPES.STUDY_INDIVIDUAL] = QUERY_TARGETS.STUDY;
      targetMap[BUCKET_TYPES.STUDY_HARMONIZATION] = QUERY_TARGETS.STUDY;
      targetMap[BUCKET_TYPES.DCE] = QUERY_TARGETS.VARIABLE;
      targetMap[BUCKET_TYPES.DCE_INDIVIDUAL] = QUERY_TARGETS.VARIABLE;
      targetMap[BUCKET_TYPES.DCE_HARMONIZATION] = QUERY_TARGETS.VARIABLE;
      targetMap[BUCKET_TYPES.DATASCHEMA] = QUERY_TARGETS.DATASET;
      targetMap[BUCKET_TYPES.DATASET] = QUERY_TARGETS.DATASET;
      targetMap[BUCKET_TYPES.DATASET_COLLECTED] = QUERY_TARGETS.DATASET;
      targetMap[BUCKET_TYPES.DATASET_HARMONIZED] = QUERY_TARGETS.DATASET;

      function decorateVocabularyHeaders(headers, vocabularyHeaders) {
        var count = 0, i = 0;
        for (var j = 0; j < vocabularyHeaders.length; j++) {
          if (count >= headers[i].termsCount) {
            i++;
            count = 0;
          }

          count += vocabularyHeaders[j].termsCount;
          vocabularyHeaders[j].taxonomyName = headers[i].entity.name;
        }
      }

      function decorateTermHeaders(headers, termHeaders, attr) {
        var idx = 0;
        return headers.reduce(function (result, h) {
          result[h.entity.name] = termHeaders.slice(idx, idx + h.termsCount).map(function (t) {
            if (h.termsCount > 1 && attr === 'vocabularyName') {
              t.canRemove = true;
            }

            t[attr] = h.entity.name;

            return t;
          });

          idx += h.termsCount;
          return result;
        }, {});
      }

      function dceUpdateBucket(val) {
        if (val) {
          $scope.selectBucket(BUCKET_TYPES.DCE);
        } else if ($scope.bucket.startsWith('dce')) {
          $scope.selectBucket(BUCKET_TYPES.STUDY);
        }
      }

      function onDceUpdateBucket(val, old) {
        if (val === old) {
          return;
        }

        dceUpdateBucket(val);
      }

      function setInitialFilter() {
        var result = StudyFilterShortcutService.getStudyClassNameChoices();

        if (result.choseAll) {
          $scope.bucketSelection._studySelection = ngObibaMica.search.STUDY_FILTER_CHOICES.ALL_STUDIES;
        } else if (result.choseIndividual) {
          $scope.bucketSelection._studySelection = ngObibaMica.search.STUDY_FILTER_CHOICES.INDIVIDUAL_STUDIES;
        } else if (result.choseHarmonization) {
          $scope.bucketSelection._studySelection = ngObibaMica.search.STUDY_FILTER_CHOICES.HARMONIZATION_STUDIES;
        }

        angular.extend($scope, result);

        var bucket = $location.search().bucket;
        if (bucket === BUCKET_TYPES.STUDY || bucket === BUCKET_TYPES.DCE) {
          $scope.bucketSelection._dceBucketSelected = bucket === BUCKET_TYPES.DCE; // don't trigger the watch callback
        }
      }

      function onLocationChange() {
        var search = $location.search();
        if (search.display && search.display === DISPLAY_TYPES.COVERAGE) {
          $scope.bucket = search.bucket ? search.bucket : CoverageGroupByService.defaultBucket();
          $scope.bucketStartsWithDce = $scope.bucket.startsWith('dce');
          $scope.singleStudy = CoverageGroupByService.isSingleStudy();
          setInitialFilter();
        }
      }

      function updateBucket(groupBy) {
        if ($scope.groupByOptions.canShowVariableTypeFilter(groupBy)) {
          $scope.selectBucket(groupBy);
        } else if (BUCKET_TYPES.STUDY !== groupBy) {
          $scope.selectBucket(BUCKET_TYPES.DCE);
        }
      }

      function dsUpdateBucket(groupBy) {
        $scope.selectBucket(groupBy);
      }

      function isStudyBucket() {
        return $scope.bucket.indexOf('study') > -1 || $scope.bucket.indexOf('dce') > -1;
      }

      function isDatasetBucket() {
        return $scope.bucket.indexOf('dataset') > -1;
      }

      function selectTab(tab) {
        if (tab === BUCKET_TYPES.STUDY) {
          updateBucket(($scope.bucketSelection.dceBucketSelected || $scope.groupByOptions.isSingleStudy()) ? BUCKET_TYPES.DCE : BUCKET_TYPES.STUDY);
        } else if (tab === BUCKET_TYPES.DATASET) {
          dsUpdateBucket(BUCKET_TYPES.DATASET);
        }
      }

      function getBucketUrl(bucket, id) {
        switch (bucket) {
          case BUCKET_TYPES.STUDY:
          case BUCKET_TYPES.STUDY_INDIVIDUAL:
          case BUCKET_TYPES.DCE:
          case BUCKET_TYPES.DCE_INDIVIDUAL:
            return PageUrlService.studyPage(id, 'individual');
          case BUCKET_TYPES.STUDY_HARMONIZATION:
          case BUCKET_TYPES.DCE_HARMONIZATION:
            return PageUrlService.studyPage(id, 'harmonization');
          case BUCKET_TYPES.NETWORK:
            return PageUrlService.networkPage(id);
          case BUCKET_TYPES.DATASCHEMA:
          case BUCKET_TYPES.DATASET_HARMONIZED:
            return PageUrlService.datasetPage(id, 'harmonized');
          case BUCKET_TYPES.DATASET:
          case BUCKET_TYPES.DATASET_COLLECTED:
            return PageUrlService.datasetPage(id, 'collected');
        }

        return '';
      }

      function updateFilterCriteriaInternal(selected) {
        var vocabulary = $scope.bucket.startsWith('dce') ? 'dceId' : 'id';
        var growlMsgKey = 'search.criterion.created';

        var rqlQuery = RqlQueryService.parseQuery($location.search().query);
        var targetQuery = RqlQueryService.findTargetQuery(targetMap[$scope.bucket], rqlQuery);
        if (!targetQuery) {
          targetQuery = new RqlQuery(targetMap[$scope.bucket]);
          rqlQuery.args.push(targetQuery);
        }

        var foundVocabularyQuery = RqlQueryService.findQueryInTargetByVocabulary(targetQuery, vocabulary);
        var vocabularyQuery;

        if (foundVocabularyQuery) {
          growlMsgKey = 'search.criterion.updated';
          vocabularyQuery = foundVocabularyQuery;
          if (vocabularyQuery.name === RQL_NODE.EXISTS) {
            vocabularyQuery.name = RQL_NODE.IN;
          }
        } else {
          vocabularyQuery = new RqlQuery(RQL_NODE.IN);
        }

        vocabularyQuery.args = ['Mica_' + targetMap[$scope.bucket] + '.' + vocabulary];
        vocabularyQuery.args.push(selected.map(function (selection) { return selection.value; }));

        if (!foundVocabularyQuery) {
          if (targetQuery.args.length > 0) {
            var andQuery = new RqlQuery(RQL_NODE.AND);
            targetQuery.args.forEach(function (arg) { andQuery.args.push(arg); });
            andQuery.args.push(vocabularyQuery);
            targetQuery.args = [andQuery];
          } else {
            targetQuery.args = [vocabularyQuery];
          }
        }

        $location.search('query', new RqlQuery().serializeArgs(rqlQuery.args));

        TaxonomyService.findVocabularyInTaxonomy(targetMap[$scope.bucket], 'Mica_' + targetMap[$scope.bucket], vocabulary)
          .then(function (foundVocabulary) {
            AlertService.growl({
              id: 'SearchControllerGrowl',
              type: 'info',
              msgKey: growlMsgKey,
              msgArgs: [foundVocabulary ?
                LocalizedValues.forLocale(foundVocabulary.title, $translate.use()) :
                vocabulary, $filter('translate')('taxonomy.target.' + targetMap[$scope.bucket])],
              delay: 3000
            });
          });

      }

      function splitIds() {
        var cols = {
          colSpan: $scope.bucket.startsWith('dce') ? (CoverageGroupByService.isSingleStudy() ? 2 : 3) : 1,
          ids: {}
        };

        var rowSpans = {};

        function appendRowSpan(id) {
          var rowSpan;
          if (!rowSpans[id]) {
            rowSpan = 1;
            rowSpans[id] = 1;
          } else {
            rowSpan = 0;
            rowSpans[id] = rowSpans[id] + 1;
          }
          return rowSpan;
        }

        var minMax = {};

        function appendMinMax(id, start, end) {
          if (minMax[id]) {
            if (start < minMax[id][0]) {
              minMax[id][0] = start;
            }
            if (end > minMax[id][1]) {
              minMax[id][1] = end;
            }
          } else {
            minMax[id] = [start, end];
          }
        }

        function toTime(yearMonth, start) {
          var res;
          if (yearMonth) {
            if (yearMonth.indexOf('-') > 0) {
              var ym = yearMonth.split('-');
              if (!start) {
                var m = parseInt(ym[1]);
                if (m < 12) {
                  ym[1] = m + 1;
                } else {
                  ym[0] = parseInt(ym[0]) + 1;
                  ym[1] = 1;
                }
              }
              var ymStr = ym[0] + '/' + ym[1] + '/01';
              res = Date.parse(ymStr);
            } else {
              res = start ? Date.parse(yearMonth + '/01/01') : Date.parse(yearMonth + '/12/31');
            }
          }
          return res;
        }

        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth() + 1;
        var currentYearMonth = currentYear + '-' + currentMonth;
        var currentDate = toTime(currentYearMonth, true);

        function getProgress(startYearMonth, endYearMonth) {
          var start = toTime(startYearMonth, true);
          var end = endYearMonth ? toTime(endYearMonth, false) : currentDate;
          var current = end < currentDate ? end : currentDate;
          if (end === start) {
            return 100;
          } else {
            return Math.round(startYearMonth ? 100 * (current - start) / (end - start) : 0);
          }
        }

        var odd = true;
        var groupId;
        $scope.result.rows.forEach(function (row, i) {
          row.hitsTitles = row.hits.map(function (hit) {
            return LocalizedValues.formatNumber(hit);
          });
          cols.ids[row.value] = [];
          if ($scope.bucket.startsWith('dce')) {
            var ids = row.value.split(':');
            var isHarmo = row.className.indexOf('Harmonization') > -1 || ids[2] === '.'; // would work for both HarmonizationDataset and HarmonizationStudy
            var titles = row.title.split(':');
            var descriptions = row.description.split(':');
            var rowSpan;
            var id;

            // study
            id = ids[0];
            if (!groupId) {
              groupId = id;
            } else if (id !== groupId) {
              odd = !odd;
              groupId = id;
            }
            rowSpan = appendRowSpan(id);
            appendMinMax(id, row.start || currentYearMonth, row.end || currentYearMonth);
            cols.ids[row.value].push({
              id: CoverageGroupByService.isSingleStudy() ? '-' : id,
              url: PageUrlService.studyPage(id, isHarmo ? 'harmonization' : 'individual'),
              title: titles[0],
              description: descriptions[0],
              rowSpan: rowSpan,
              index: i++
            });

            // population
            id = ids[0] + ':' + ids[1];
            rowSpan = appendRowSpan(id);
            cols.ids[row.value].push({
              id: id,
              url: PageUrlService.studyPopulationPage(ids[0], isHarmo ? 'harmonization' : 'individual', ids[1]),
              title: titles[1],
              description: descriptions[1],
              rowSpan: rowSpan,
              index: i++
            });

            // dce
            cols.ids[row.value].push({
              id: isHarmo ? '-' : row.value,
              title: titles[2],
              description: descriptions[2],
              start: row.start,
              current: currentYearMonth,
              end: row.end,
              progressClass: odd ? 'info' : 'warning',
              url: PageUrlService.StudyDcePage(ids[0], isHarmo ? 'harmonization' : 'individual', row.value),
              rowSpan: 1,
              index: i++
            });
          } else {
            var parts = $scope.bucket.split('-');
            var itemBucket = parts[0];
            if (itemBucket === BUCKET_TYPES.DATASET) {
              itemBucket = itemBucket + (row.className.indexOf('Harmonization') > -1 ? '-harmonized' : '-collected');
            } else {
              itemBucket = itemBucket + (row.className.indexOf('Harmonization') > -1 ? '-harmonization' : '-individual');
            }

            cols.ids[row.value].push({
              id: row.value,
              url: getBucketUrl(itemBucket, row.value),
              title: row.title,
              description: row.description,
              min: row.start,
              start: row.start,
              current: currentYear,
              end: row.end,
              max: row.end,
              progressStart: 0,
              progress: getProgress(row.start ? row.start + '-01' : currentYearMonth, row.end ? row.end + '-12' : currentYearMonth),
              progressClass: odd ? 'info' : 'warning',
              rowSpan: 1,
              index: i++
            });
            odd = !odd;
          }
        });

        // adjust the rowspans and the progress
        if ($scope.bucket.startsWith('dce')) {
          $scope.result.rows.forEach(function (row, i) {
            row.hitsTitles = row.hits.map(function (hit) {
              return LocalizedValues.formatNumber(hit);
            });
            if (cols.ids[row.value][0].rowSpan > 0) {
              cols.ids[row.value][0].rowSpan = rowSpans[cols.ids[row.value][0].id];
            }
            if (cols.ids[row.value][1].rowSpan > 0) {
              cols.ids[row.value][1].rowSpan = rowSpans[cols.ids[row.value][1].id];
            }
            var ids = row.value.split(':');
            if (minMax[ids[0]]) {
              var min = minMax[ids[0]][0];
              var max = minMax[ids[0]][1];
              var start = cols.ids[row.value][2].start || currentYearMonth;
              var end = cols.ids[row.value][2].end || currentYearMonth;
              var diff = toTime(max, false) - toTime(min, true);
              // set the DCE min and max dates of the study
              cols.ids[row.value][2].min = min;
              cols.ids[row.value][2].max = max;
              // compute the progress
              cols.ids[row.value][2].progressStart = 100 * (toTime(start, true) - toTime(min, true)) / diff;
              cols.ids[row.value][2].progress = 100 * (toTime(end, false) - toTime(start, true)) / diff;
              cols.ids[row.value].index = i;
            }
          });
        }

        return cols;
      }

      function mergeCriteriaItems(criteria) {
        return criteria.reduce(function (prev, item) {
          if (prev) {
            RqlQueryService.updateCriteriaItem(prev, item);
            return prev;
          }

          item.rqlQuery = RqlQueryUtils.buildRqlQuery(item); // TODO
          return item;
        }, null);
      }

      function updateStudyClassNameFilter(choice) {
        StudyFilterShortcutService.filter(choice, $scope.lang);
      }

      function init() {
        $scope.rowPopupState = null;
        $scope.fullCoverageDisabled = true;
        onLocationChange();
      }

      function onRowMouseOver(event, row) {
        rowPopupState.update(event.target, row);
        $scope.rowPopupState = rowPopupState;
      }

      function onRowMouseLeave() {
        rowPopupState.reset();
        $scope.rowPopupState = null;
      }

      function loadMoreRows() {
        if ($scope.result && $scope.result.rows) {
          var ceiling = Math.ceil($scope.result.rows.length / $scope.rowsPageSize);

          if (ceiling > $scope.nextFilteredRowsPage) {
            var nextPage = $scope.result.rows.slice($scope.rowsPageSize * $scope.nextFilteredRowsPage, $scope.rowsPageSize * ($scope.nextFilteredRowsPage + 1));
            $scope.nextFilteredRowsPage++;

            $scope.filteredRows.push.apply($scope.filteredRows, nextPage);
          }
        }
      }

      $scope.loadMoreRows = loadMoreRows;
      $scope.filteredRows = [];
      $scope.rowsPageSize = 20;
      $scope.nextFilteredRowsPage = 0;
      $scope.onRowMouseOver = onRowMouseOver;
      $scope.onRowMouseLeave = onRowMouseLeave;
      $scope.totalOptions = ngObibaMicaSearch.getOptions().coverage.total;
      $scope.showMissing = true;
      $scope.toggleMissing = function (value) {
        $scope.showMissing = value;
      };

      $scope.groupByOptions = CoverageGroupByService;
      $scope.bucketSelection = {
        get studySelection() {
          return this._studySelection;
        },
        set studySelection(value) {
          this._studySelection = value;

          if (!$scope.bucket || ($scope.bucket && ($scope.bucket.indexOf(BUCKET_TYPES.STUDY) > -1 || $scope.bucket.indexOf(BUCKET_TYPES.DCE) > -1))) {
            updateBucket($scope.bucket.split('-')[0]);
          } else if ($scope.bucket && $scope.bucket.indexOf(BUCKET_TYPES.DATASET) > -1) {
            dsUpdateBucket($scope.bucket.split('-')[0]);
          }

          updateStudyClassNameFilter(value);
        },
        get dceBucketSelected() {
          return this._dceBucketSelected;
        },
        set dceBucketSelected(value) {
          var oldValue = this._dceBucketSelected;
          this._dceBucketSelected = value;

          onDceUpdateBucket(value, oldValue);
        }
      };

      $scope.isStudyBucket = isStudyBucket;
      $scope.isDatasetBucket = isDatasetBucket;
      $scope.selectTab = selectTab;

      $scope.selectBucket = function (bucket) {

        $scope.bucket = bucket;
        $scope.$parent.onBucketChanged(bucket);
      };

      $scope.$on('$locationChangeSuccess', onLocationChange);
      $scope.rowspans = {};

      $scope.getSpan = function (study, population) {
        var length = 0;
        if (population) {
          var prefix = study + ':' + population;
          length = $scope.result.rows.filter(function (row) {
            return row.title.startsWith(prefix + ':');
          }).length;
          $scope.rowspans[prefix] = length;
          return length;
        } else {
          length = $scope.result.rows.filter(function (row) {
            return row.title.startsWith(study + ':');
          }).length;
          $scope.rowspans[study] = length;
          return length;
        }
      };

      $scope.hasSpan = function (study, population) {
        if (population) {
          return $scope.rowspans[study + ':' + population] > 0;
        } else {
          return $scope.rowspans[study] > 0;
        }
      };

      $scope.hasVariableTarget = function () {
        var query = $location.search().query;
        return query && RqlQueryUtils.hasTargetQuery(RqlQueryService.parseQuery(query), RQL_NODE.VARIABLE);
      };

      $scope.hasSelected = function () {
        return $scope.table && $scope.table.rows && $scope.table.rows.filter(function (r) {
          return r.selected;
        }).length;
      };

      $scope.selectAll = function () {
        if ($scope.table && $scope.table.rows) {
          $scope.table.rows.forEach(function (r) {
            r.selected = true;
          });
        }
      };

      $scope.selectNone = function () {
        if ($scope.table && $scope.table.rows) {
          $scope.table.rows.forEach(function (r) {
            r.selected = false;
          });
        }
      };

      $scope.selectFull = function () {
        if ($scope.table && $scope.table.rows) {
          $scope.table.rows.forEach(function (r) {
            if (r.hits) {
              r.selected = r.hits.filter(function (h) {
                return h === 0;
              }).length === 0;
            } else {
              r.selected = false;
            }
          });
        }
      };

      $scope.BUCKET_TYPES = BUCKET_TYPES;

      $scope.downloadUrl = function () {
        return PageUrlService.downloadCoverage($scope.query);
      };

      $scope.$watch('result', function () {
        $scope.table = { cols: [] };
        vocabulariesTermsMap = {};

        if ($scope.result && $scope.result.rows) {
          var tableTmp = $scope.result;
          tableTmp.cols = splitIds();
          $scope.table = tableTmp;

          $scope.filteredRows = [];
          $scope.nextFilteredRowsPage = 0;

          $scope.loadMoreRows();

          vocabulariesTermsMap = decorateTermHeaders($scope.table.vocabularyHeaders, $scope.table.termHeaders, 'vocabularyName');
          decorateTermHeaders($scope.table.taxonomyHeaders, $scope.table.termHeaders, 'taxonomyName');
          decorateVocabularyHeaders($scope.table.taxonomyHeaders, $scope.table.vocabularyHeaders);
          $scope.isFullCoverageImpossibleOrCoverageAlreadyFull();
        }
      });

      $scope.updateCriteria = function (id, term, idx, type) {
        var vocabulary = $scope.bucket.startsWith('dce') ? 'dceId' : 'id';
        var criteria = { varItem: RqlQueryService.createCriteriaItem(QUERY_TARGETS.VARIABLE, term.taxonomyName, term.vocabularyName, term.entity.name) };

        // if id is null, it is a click on the total count for the term
        if (id) {
          var groupBy = $scope.bucket.split('-')[0];
          if (groupBy === 'dce' && id.endsWith(':.')) {
            groupBy = 'study';
            var studyId = id.split(':')[0];
            criteria.item = RqlQueryService.createCriteriaItem(targetMap[groupBy], 'Mica_' + targetMap[groupBy], 'id', studyId);
          } else {
            criteria.item = RqlQueryService.createCriteriaItem(targetMap[groupBy], 'Mica_' + targetMap[groupBy], vocabulary, id);
          }
        } else if ($scope.bucket.endsWith('individual')) {
          criteria.item = RqlQueryService.createCriteriaItem(QUERY_TARGETS.STUDY, 'Mica_' + QUERY_TARGETS.STUDY, 'className', 'Study');
        } else if ($scope.bucket.endsWith('harmonization')) {
          criteria.item = RqlQueryService.createCriteriaItem(QUERY_TARGETS.STUDY, 'Mica_' + QUERY_TARGETS.STUDY, 'className', 'HarmonizationStudy');
        } else if ($scope.bucket.endsWith('collected')) {
          criteria.item = RqlQueryService.createCriteriaItem(QUERY_TARGETS.DATASET, 'Mica_' + QUERY_TARGETS.DATASET, 'className', 'StudyDataset');
        } else if ($scope.bucket.endsWith('harmonized')) {
          criteria.item = RqlQueryService.createCriteriaItem(QUERY_TARGETS.DATASET, 'Mica_' + QUERY_TARGETS.DATASET, 'className', 'HarmonizationDataset');
        }

        $q.all(criteria).then(function (criteria) {
          $scope.onUpdateCriteria(criteria.varItem, type, false, true);
          if (criteria.item) {
            $scope.onUpdateCriteria(criteria.item, type);
          }
          if (criteria.bucketItem) {
            $scope.onUpdateCriteria(criteria.bucketItem, type);
          }
        });
      };

      $scope.isFullCoverageImpossibleOrCoverageAlreadyFull = function () {
        var rows = $scope.table ? ($scope.table.rows || []) : [];
        var rowsWithZeroHitColumn = 0;

        if (rows.length === 0) {
          return true;
        }

        rows.forEach(function (row) {
          if (row.hits) {
            if (row.hits.filter(function (hit) { return hit === 0; }).length > 0) {
              rowsWithZeroHitColumn++;
            }
          }
        });

        $scope.fullCoverageDisabled = rowsWithZeroHitColumn === 0 || rows.length === rowsWithZeroHitColumn;
      };

      $scope.selectFullAndFilter = function () {
        var selected = [];
        if ($scope.table && $scope.table.rows) {
          $scope.table.rows.forEach(function (r) {
            if (r.hits) {
              if (r.hits.filter(function (h) {
                return h === 0;
              }).length === 0) {
                selected.push(r);
              }
            }
          });
        }
        updateFilterCriteriaInternal(selected, true);
      };

      $scope.updateFilterCriteria = function () {
        updateFilterCriteriaInternal($scope.table.rows.filter(function (r) {
          return r.selected;
        }));
      };

      $scope.removeTerm = function (term) {
        var remainingCriteriaItems = vocabulariesTermsMap[term.vocabularyName].filter(function (t) {
          return t.entity.name !== term.entity.name;
        }).map(function (t) {
          return RqlQueryService.createCriteriaItem(QUERY_TARGETS.VARIABLE, t.taxonomyName, t.vocabularyName, t.entity.name);
        });

        $q.all(remainingCriteriaItems).then(function (criteriaItems) {
          $scope.onUpdateCriteria(mergeCriteriaItems(criteriaItems), null, true, false, false);
        });
      };

      $scope.removeVocabulary = function (vocabulary) {
        RqlQueryService.createCriteriaItem(QUERY_TARGETS.VARIABLE, vocabulary.taxonomyName, vocabulary.entity.name).then(function (item) {
          $scope.onRemoveCriteria(item);
        });
      };

      $scope.onZeroColumnsToggle = function () {
        $scope.coverage.withZeros = !$scope.coverage.withZeros;
        $location.search('withZeros', $scope.coverage.withZeros ? 'true' : 'false');
      };

      $scope.coverage = {
        withZeros: $location.search().withZeros === undefined || $location.search().withZeros === 'true' ? true : false
      };

      init();
    }])

  .directive('coverageResultTable', [function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        result: '=',
        loading: '=',
        bucket: '=',
        query: '=',
        criteria: '=',
        onUpdateCriteria: '=',
        onRemoveCriteria: '='
      },
      controller: 'CoverageResultTableController',
      templateUrl: 'search/components/result/coverage-result/component.html'
    };
  }]);
