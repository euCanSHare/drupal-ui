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


/* global DISPLAY_TYPES */
/* global CriteriaItem */
/* global CriteriaItemBuilder */
/* global CriteriaBuilder */

/* exported QUERY_TYPES */
var QUERY_TYPES = {
  NETWORKS: 'networks',
  STUDIES: 'studies',
  DATASETS: 'datasets',
  VARIABLES: 'variables'
};

/* exported QUERY_TARGETS */
var QUERY_TARGETS = {
  NETWORK: 'network',
  STUDY: 'study',
  DATASET: 'dataset',
  VARIABLE: 'variable',
  TAXONOMY: 'taxonomy'
};

/* exported BUCKET_TYPES */
var BUCKET_TYPES = {
  NETWORK: 'network',
  STUDY: 'study',
  STUDY_INDIVIDUAL: 'study-individual',
  STUDY_HARMONIZATION: 'study-harmonization',
  DCE: 'dce',
  DCE_INDIVIDUAL: 'dce-individual',
  DCE_HARMONIZATION: 'dce-harmonization',
  DATASET: 'dataset',
  DATASET_COLLECTED: 'dataset-collected',
  DATASET_HARMONIZED: 'dataset-harmonized',
  DATASCHEMA: 'dataschema'
};

/* exported RQL_NODE */
var RQL_NODE = {
  // target nodes
  VARIABLE: 'variable',
  DATASET: 'dataset',
  STUDY: 'study',
  NETWORK: 'network',

  /* target children */
  LIMIT: 'limit',
  SORT: 'sort',
  AND: 'and',
  NAND: 'nand',
  OR: 'or',
  NOR: 'nor',
  NOT: 'not',
  FACET: 'facet',
  LOCALE: 'locale',
  AGGREGATE: 'aggregate',
  BUCKET: 'bucket',
  FIELDS: 'fields',
  FILTER: 'filter',

  /* leaf criteria nodes */
  CONTAINS: 'contains',
  IN: 'in',
  OUT: 'out',
  EQ: 'eq',
  GT: 'gt',
  GE: 'ge',
  LT: 'lt',
  LE: 'le',
  BETWEEN: 'between',
  MATCH: 'match',
  EXISTS: 'exists',
  MISSING: 'missing'
};

/* exported SORT_FIELDS */
var SORT_FIELDS = {
  ACRONYM: 'acronym',
  NAME: 'name',
  CONTAINER_ID: 'containerId',
  POPULATION_WEIGHT: 'populationWeight',
  DATA_COLLECTION_EVENT_WEIGHT: 'dataCollectionEventWeight',
  POPULATION_ID: 'populationId',
  DATASET_ID: 'datasetId',
  VARIABLE_TYPE: 'variableType',
  INDEX: 'index',
  STUDY_TABLE: {
    POPULATION_WEIGHT: 'studyTable.populationWeight',
    DATA_COLLECTION_EVENT_WEIGHT: 'studyTable.dataCollectionEventWeight',
    STUDY_ID: 'studyTable.studyId',
    POPULATION_ID: 'studyTable.populationId'
  }
};

/* exported targetToType */
function targetToType(target) {
  switch (target.toLocaleString()) {
    case QUERY_TARGETS.NETWORK:
      return QUERY_TYPES.NETWORKS;
    case QUERY_TARGETS.STUDY:
      return QUERY_TYPES.STUDIES;
    case QUERY_TARGETS.DATASET:
      return QUERY_TYPES.DATASETS;
    case QUERY_TARGETS.VARIABLE:
      return QUERY_TYPES.VARIABLES;
  }

  throw new Error('Invalid target: ' + target);
}

/* exported targetToType */
function typeToTarget(type) {
  switch (type.toLocaleString()) {
    case QUERY_TYPES.NETWORKS:
      return QUERY_TARGETS.NETWORK;
    case QUERY_TYPES.STUDIES:
      return QUERY_TARGETS.STUDY;
    case QUERY_TYPES.DATASETS:
      return QUERY_TARGETS.DATASET;
    case QUERY_TYPES.VARIABLES:
      return QUERY_TARGETS.VARIABLE;
  }

  throw new Error('Invalid type: ' + type);
}

(function () {
  function RqlQueryService($q,
    $log,
    TaxonomiesResource,
    TaxonomyResource,
    LocalizedValues,
    VocabularyService,
    RqlQueryUtils,
    ngObibaMicaSearch) {

    var self = this;
    var searchOptions = ngObibaMicaSearch.getOptions();
    this.findItemNodeById = function (root, targetId, result, strict) {
      var splitTagetId = targetId.split('.');

      if (root && root.children && result) {
        return root.children.some(function (child) {
          if (strict ? targetId === child.id : (child.id && child.id.split('.').reduce(function (acc, val) { return acc && splitTagetId.indexOf(val) > -1; }, true))) {
            result.item = child;
            return true;
          }

          return self.findItemNodeById(child, targetId, result, strict);
        });
      }

      return false;
    };

    this.findItemNode = function (root, item, result) {
      return self.findItemNodeById(root, item.id, result);
    };

    function findTargetCriteria(target, rootCriteria) {
      return rootCriteria.children.filter(function (child) {
        return child.target === target;
      }).pop();
    }

    function findCriteriaItemFromTreeById(target, targetId, rootCriteria, strict) {
      var targetItem = findTargetCriteria(target, rootCriteria);
      var result = {};
      if (self.findItemNodeById(targetItem, targetId, result, strict)) {
        return result.item;
      }

      return null;
    }

    function findCriteriaItemFromTree(item, rootCriteria) {
      var targetItem = findTargetCriteria(item.target, rootCriteria);
      var result = {};
      if (self.findItemNode(targetItem, item, result)) {
        return result.item;
      }

      return null;
    }

    function findTargetQuery(target, query) {
      return query.args.filter(function (arg) {
        return arg.name === target;
      }).pop();
    }

    function findQueryInTargetByTaxonomyVocabulary(target, taxonomy, vocabulary) {
      if (!target) {
        return null;
      }

      function search(parent, rx, result) {
        return parent.args.some(function (arg) {
          if (null !== rx.exec(arg)) {
            result.parent = parent;
            return true;
          }

          if (arg instanceof RqlQuery) {
            return search(arg, rx, result);
          }

          return false;

        });
      }

      var result = {};
      search(target, new RegExp((taxonomy ? taxonomy : '') + '\\.' + vocabulary + '$'), result);
      return result.parent;
    }

    function findQueryInTargetByVocabulary(target, vocabulary) {
      return findQueryInTargetByTaxonomyVocabulary(target, null, vocabulary);
    }

    function getSourceFields(context, target) {
      switch (context) {
        case DISPLAY_TYPES.LIST:
          switch (target) {
            case QUERY_TARGETS.STUDY:
              return RqlQueryUtils.fields(searchOptions.studies.fields);

            case QUERY_TARGETS.VARIABLE:
              var fields = (searchOptions.variables.fields || [])
                .concat((searchOptions.variables.annotationTaxonomies || [])
                  .map(function(taxonomy) {
                    return 'attributes.' + taxonomy + '*';
                  })
                );
              return RqlQueryUtils.fields(fields);

            case QUERY_TARGETS.DATASET:
              return RqlQueryUtils.fields(searchOptions.datasets.fields);

            case QUERY_TARGETS.NETWORK:
              return RqlQueryUtils.fields(searchOptions.networks.fields);
          }
          break;
      }

      return null;
    }

    function isOperator(name) {
      switch (name) {
        case RQL_NODE.AND:
        case RQL_NODE.NAND:
        case RQL_NODE.OR:
        case RQL_NODE.NOR:
          return true;
      }

      return false;
    }

    function isTarget(name) {
      switch (name) {
        case RQL_NODE.VARIABLE:
        case RQL_NODE.DATASET:
        case RQL_NODE.NETWORK:
        case RQL_NODE.STUDY:
          return true;
      }

      return false;
    }

    function isLeaf(name) {
      switch (name) {
        case RQL_NODE.CONTAINS:
        case RQL_NODE.IN:
        case RQL_NODE.OUT:
        case RQL_NODE.EQ:
        case RQL_NODE.GT:
        case RQL_NODE.GE:
        case RQL_NODE.LT:
        case RQL_NODE.LE:
        case RQL_NODE.BETWEEN:
        case RQL_NODE.MATCH:
        case RQL_NODE.EXISTS:
        case RQL_NODE.MISSING:
          return true;
      }

      return false;
    }

    function isLeafCriteria(item) {
      return isLeaf(item.type);
    }

    function deleteNode(item) {
      var parent = item.parent;
      var query = item.rqlQuery;
      var queryArgs = query.args;
      var parentQuery = item.parent.rqlQuery;
      var index = parentQuery.args.indexOf(query);
      var indexChild = parent.children.indexOf(item);

      if (index === -1 || indexChild === -1) {
        throw new Error('Criteria node not found: ' + item);
      }

      parent.children.splice(indexChild, 1);
      item.children.forEach(function (c) {
        c.parent = parent;
      });
      parent.children.splice.apply(parent.children, [indexChild, 0].concat(item.children));

      parentQuery.args.splice(index, 1);

      if (queryArgs) {
        if (queryArgs instanceof Array) {
          parentQuery.args.splice.apply(parentQuery.args, [index, 0].concat(queryArgs));
        } else {
          parentQuery.args.splice(index, 0, queryArgs);
        }
      }

      if (parent.parent !== null && parentQuery.args.length === 0) {
        deleteNode(parent);
      }
    }

    function deleteNodeCriteriaWithOrphans(item) {
      var parent = item.parent;
      var query = item.rqlQuery;
      var queryArgs = query.args;
      var parentQuery = item.parent.rqlQuery;
      var index = parentQuery.args.indexOf(query);
      var indexChild = parent.children.indexOf(item);

      if (index === -1 || indexChild === -1) {
        throw new Error('Criteria node not found: ' + item);
      }

      parent.children.splice(indexChild, 1);
      item.children.forEach(function (c) {
        c.parent = parent;
      });
      parent.children.splice.apply(parent.children, [indexChild, 0].concat(item.children));

      parentQuery.args.splice(index, 1);

      if (queryArgs) {
        if (queryArgs instanceof Array) {
          parentQuery.args.splice.apply(parentQuery.args, [index, 0].concat(queryArgs));
        } else {
          parentQuery.args.splice(index, 0, queryArgs);
        }
      }

      if (parentQuery.args.length === 0) {
        deleteNode(parent);
      }
    }

    function deleteLeafCriteria(item) {
      var parent = item.parent;
      if (!parent) {
        throw new Error('Cannot remove criteria when parent is NULL');
      }

      var query = item.rqlQuery;
      var parentQuery = item.parent.rqlQuery;
      var index = parentQuery.args.indexOf(query);

      if (index === -1) {
        throw new Error('Criteria node not found: ' + item);
      }

      parentQuery.args.splice(index, 1);

      if ([RQL_NODE.OR, RQL_NODE.AND, RQL_NODE.NAND, RQL_NODE.NOR].indexOf(parent.type) !== -1) {
        deleteNodeCriteriaWithOrphans(parent);
      } else if (parentQuery.args.length === 0) {
        deleteNode(parent);
      }

    }

    /**
     * NOTE: once the FreeTextMatch has a UI this is no longer needed.
     *
     * @param query
     * @returns boolean if target has more than a FreeTextMatch
     */
    function queryHasCriteria(query) {
      if (query && query.args) {
        var leafQueries = query.args.filter(function (arg) {
          return isLeaf(arg.name) || isOperator(arg.name);
        });

        if (leafQueries.length === 1 && RqlQueryUtils.isFreeTextMatch(leafQueries[0])) {
          return false;
        }

        return leafQueries.length > 0;
      }

      return false;
    }

    function getRenderableTargetCriteria(targets) {
      return (targets || []).filter(function (target) {
        return queryHasCriteria(target.rqlQuery);
      });
    }

    function getRenderableTargetCriteriaFromRoot(rootCriteria) {
      return rootCriteria ?
        getRenderableTargetCriteria(rootCriteria.children) :
        [];
    }

    this.getRenderableTargetCriteria = getRenderableTargetCriteria;
    this.getRenderableTargetCriteriaFromRoot = getRenderableTargetCriteriaFromRoot;

    this.parseQuery = function (query) {
      try {
        return new RqlParser().parse(query);
      } catch (e) {
        $log.error(e.message);
      }

      return new RqlQuery();
    };

    /**
     * Removes the item from criteria item tree. This should be from a leaf.
     * @param item
     */
    this.removeCriteriaItem = function (item) {
      if (isLeafCriteria(item)) {
        deleteLeafCriteria(item);
      } else {
        deleteNode(item);
      }
    };

    /**
     * Creates a criteria item
     * @param target
     * @param taxonomy
     * @param vocabulary
     * @param term
     * @param lang
     * @returns A criteria item
     */
    this.createCriteriaItem = function (target, taxonomy, vocabulary, term, lang) {
      function createBuilder(taxonomy, vocabulary, term) {
        return new CriteriaItemBuilder(LocalizedValues, lang)
          .target(target)
          .taxonomy(taxonomy)
          .vocabulary(vocabulary)
          .term(term);
      }

      if (angular.isString(taxonomy)) {
        return TaxonomyResource.get({
          target: target,
          taxonomy: taxonomy
        }).$promise.then(function (taxonomy) {
          vocabulary = taxonomy.vocabularies.filter(function (v) {
            return v.name === vocabulary || VocabularyService.vocabularyAlias(v) === vocabulary;
          })[0];
          term = vocabulary && vocabulary.terms ?
            vocabulary.terms.filter(function (t) { return t.name === term; })[0] :
            null;

          return createBuilder(taxonomy, vocabulary, term).build();
        });
      }

      return createBuilder(taxonomy, vocabulary, term).build();
    };

    /**
     * Adds new item to the item tree
     *
     * @param rootItem
     * @param item
     */
    this.addCriteriaItem = function (rootRql, newItem, logicalOp) {
      var target = rootRql.args.filter(function (query) {
        return newItem.target === query.name;
      }).pop();

      if (!target) {
        target = new RqlQuery(RQL_NODE[newItem.target.toUpperCase()]);
        rootRql.args.push(target);
      }

      var rqlQuery = newItem.rqlQuery ? newItem.rqlQuery : RqlQueryUtils.buildRqlQuery(newItem);
      return RqlQueryUtils.addQuery(target, rqlQuery, logicalOp);
    };

    /**
     * Update an existing item to the item tree
     *
     * @param rootItem
     * @param item
     */
    this.updateCriteriaItem = function (existingItem, newItem, replace) {
      var newTerms;
      var isRepeatable = existingItem.isRepeatable();
      var isMatchNode = !isRepeatable && existingItem.rqlQuery.name === RQL_NODE.MATCH;

      function updateItemForExistsQuery() {
        existingItem = isRepeatable ? existingItem.first() : existingItem;
        existingItem.rqlQuery.name = RQL_NODE.EXISTS;
        existingItem.rqlQuery.args.splice(1, 1);
      }

      if (newItem.rqlQuery && RQL_NODE.EXISTS === newItem.rqlQuery.name) {
        updateItemForExistsQuery();
      } else {

        if (replace && newItem.rqlQuery) {
          existingItem.rqlQuery.name = newItem.rqlQuery.name;
        }

        if (newItem.rqlQuery) {
          newTerms = newItem.rqlQuery.args[isMatchNode ? 0 : 1];
        } else if (newItem.term) {
          newTerms = [newItem.term.name];
        } else {
          updateItemForExistsQuery();
        }

        if (newTerms) {
          if (isRepeatable) {
            RqlQueryUtils.updateRepeatableQueryArgValues(existingItem, newTerms);
          } else {
            RqlQueryUtils.updateQueryArgValues(existingItem.rqlQuery, newTerms, replace);
          }
        }
      }
    };

    /**
     * Builders registry
     *
     * @type {{variable: builders.variable, study: builders.study}}
     */
    this.builders = function (target, rootRql, rootItem, lang) {
      var deferred = $q.defer();

      function build(rootRql, rootItem, taxonomies) {
        var builder = new CriteriaBuilder(rootRql, rootItem, taxonomies, LocalizedValues, lang);
        builder.initialize(target);
        builder.build();
        deferred.resolve({ root: builder.getRootItem(), map: builder.getLeafItemMap() });
      }

      TaxonomiesResource.get({target: target})
        .$promise
        .then(function (taxonomies) {
          build(rootRql, rootItem, taxonomies);
        });

      return deferred.promise;
    };

    /**
     * Builds the criteria tree
     *
     * @param rootRql
     * @param lang
     * @returns {*}
     */
    this.createCriteria = function (rootRql, lang) {
      var deferred = $q.defer();
      var rootItem = new CriteriaItemBuilder().type(RQL_NODE.AND).rqlQuery(rootRql).build();
      var leafItemMap = {};

      if (!RqlQueryUtils.hasTargetQuery(rootRql)) {
        deferred.resolve({ root: rootItem, map: leafItemMap });
        return deferred.promise;
      }

      var queries = [];
      var self = this;
      var resolvedCount = 0;

      rootRql.args.forEach(function (node) {
        if (QUERY_TARGETS[node.name.toUpperCase()]) {
          queries.push(node);
        }
      });

      queries.forEach(function (node) {
        self.builders(node.name, node, rootItem, lang).then(function (result) {
          rootItem.children.push(result.root);
          leafItemMap = angular.extend(leafItemMap, result.map);
          resolvedCount++;
          if (resolvedCount === queries.length) {
            deferred.resolve({ root: rootItem, map: leafItemMap });
          }
        });
      });

      return deferred.promise;
    };

    /**
     * Append the aggregate and facet for criteria term listing.
     *
     * @param query
     * @param item
     * @param lang
     * @returns the new query
     */
    this.prepareCriteriaTermsQuery = function (query, item, lang) {
      function iterReplaceQuery(query, criteriaId, newQuery) {
        if (!query || !query.args) {
          return null;
        }

        if ((query.name === RQL_NODE.IN || query.name === RQL_NODE.MISSING || query.name === RQL_NODE.CONTAINS) && query.args[0] === criteriaId) {
          return query;
        }

        for (var i = query.args.length; i--;) {
          var res = iterReplaceQuery(query.args[i], criteriaId, newQuery);

          if (res) {
            query.args[i] = newQuery;
          }
        }
      }

      var parsedQuery = this.parseQuery(query);
      var targetQuery = parsedQuery.args.filter(function (node) {
        return node.name === item.target;
      }).pop();

      if (targetQuery) {
        var anyQuery = new RqlQuery(RQL_NODE.EXISTS),
          criteriaId = RqlQueryUtils.criteriaId(item.taxonomy, item.vocabulary);

        anyQuery.args.push(criteriaId);
        iterReplaceQuery(targetQuery, criteriaId, anyQuery);
        targetQuery.args.push(RqlQueryUtils.aggregate([criteriaId]));
        targetQuery.args.push(RqlQueryUtils.limit(0, 0));
      }

      parsedQuery.args.push(new RqlQuery(RQL_NODE.FACET));

      if (lang) {
        RqlQueryUtils.addLocaleQuery(parsedQuery, lang);
      }

      return parsedQuery.serializeArgs(parsedQuery.args);
    };

    this.getTargetQuerySort = function (type, query) {
      var target = typeToTarget(type);
      var targetQuery = findTargetQuery(target, query);
      var sort = null;
      if (targetQuery) {
        sort = targetQuery.args.filter(function (arg) {
          return arg.name === RQL_NODE.SORT;
        }).pop();
      }

      return sort;
    };

    function prepareSearchQueryInternal(context, type, query, lang, sort, addFieldsQuery) {
      var rqlQuery = angular.copy(query);
      var target = typeToTarget(type);
      RqlQueryUtils.addLocaleQuery(rqlQuery, lang);
      var targetQuery = findTargetQuery(target, rqlQuery);

      if (!targetQuery) {
        targetQuery = new RqlQuery(target);
        rqlQuery.args.push(targetQuery);
      }

      var limitQuery = RqlQueryUtils.getLimitQuery(targetQuery);
      if (!limitQuery) {
        RqlQueryUtils.addLimit(
          targetQuery,
          RqlQueryUtils.limit(0, ngObibaMicaSearch.getDefaultListPageSize(target)));
      }

      if (addFieldsQuery) {
        var fieldsQuery = getSourceFields(context, target);
        if (fieldsQuery) {
          RqlQueryUtils.addFields(targetQuery, fieldsQuery);
        }
      }

      if (sort) {
        RqlQueryUtils.addSort(targetQuery, sort);
      }

      return rqlQuery;
    }

    function prepareQueryPagination(rqlQuery, target, from, size) {
      var targetQuery = findTargetQuery(target, rqlQuery);
      if (!targetQuery) {
        targetQuery = new RqlQuery(target);
        rqlQuery.args.push(targetQuery);
      }

      RqlQueryUtils.addLimit(targetQuery, RqlQueryUtils.limit(from, size));
    }

    function getQueryPaginations(rqlQuery) {
      if (!rqlQuery || rqlQuery.args.length === 0) {
        return {};
      }

      return rqlQuery.args.reduce(function(acc, query) {
        if (isTarget(query.name)) {
          var limitQuery = RqlQueryUtils.getLimitQuery(query);
          if (limitQuery) {
            acc[query.name] = { from: limitQuery.args[0], size: limitQuery.args[1] };
          }
        }

        return acc;
      }, {});
    }

    this.isOperator = isOperator;
    this.isLeaf = isLeaf;
    this.getQueryPaginations = getQueryPaginations;
    this.prepareQueryPagination = prepareQueryPagination;
    this.findCriteriaItemFromTreeById = findCriteriaItemFromTreeById;
    this.findCriteriaItemFromTree = findCriteriaItemFromTree;
    this.findTargetCriteria = findTargetCriteria;
    this.findTargetQuery = findTargetQuery;
    this.findQueryInTargetByVocabulary = findQueryInTargetByVocabulary;
    this.findQueryInTargetByTaxonomyVocabulary = findQueryInTargetByTaxonomyVocabulary;

    this.prepareSearchQuery = function (context, type, query, lang, sort) {
      return prepareSearchQueryInternal(context, type, query, lang, sort, true);
    };

    this.prepareSearchQueryNoFields = function (context, type, query, lang, sort) {
      return prepareSearchQueryInternal(context, type, query, lang, sort, false);
    };

    this.prepareSearchQueryAndSerialize = function (context, type, query, lang, sort) {
      return new RqlQuery().serializeArgs(self.prepareSearchQuery(context, type, query, lang, sort).args);
    };

    /**
     * Append the aggregate and bucket operations to the variable.
     *
     * @param query
     * @param bucketArg
     * @returns the new query
     */
    this.prepareCoverageQuery = function (query, bucketArg) {
      var parsedQuery = this.parseQuery(query);
      var aggregate = new RqlQuery('aggregate');
      var bucketField;

      var parts = bucketArg.split('-');
      var groupBy = parts[0];
      var filterBy = parts.length > 1 ? parts[1] : undefined;

      switch (groupBy) {
        case BUCKET_TYPES.NETWORK:
          bucketField = 'networkId';
          break;
        case BUCKET_TYPES.STUDY:
        case BUCKET_TYPES.STUDY_INDIVIDUAL:
        case BUCKET_TYPES.STUDY_HARMONIZATION:
          bucketField = 'studyId';
          break;
        case BUCKET_TYPES.DCE:
        case BUCKET_TYPES.DCE_INDIVIDUAL:
          bucketField = 'dceId';
          break;
        case BUCKET_TYPES.DATASCHEMA:
        case BUCKET_TYPES.DATASET:
        case BUCKET_TYPES.DATASET_COLLECTED:
        case BUCKET_TYPES.DATASET_HARMONIZED:
          bucketField = 'datasetId';
          break;
      }

      var bucket = new RqlQuery('bucket');
      bucket.args.push(bucketField);
      aggregate.args.push(bucket);

      // variable RQL
      var variable;
      parsedQuery.args.forEach(function (arg) {
        if (!variable && arg.name === 'variable') {
          variable = arg;
        }
      });
      if (!variable) {
        variable = new RqlQuery('variable');
        parsedQuery.args.push(variable);
      }

      if (variable.args.length > 0 && variable.args[0].name !== 'limit') {
        var variableType = new RqlQuery('in');
        variableType.args.push('Mica_variable.variableType');
        if (filterBy === undefined) {
          if (bucketArg === BUCKET_TYPES.DATASET_HARMONIZED || bucketArg === BUCKET_TYPES.DATASCHEMA) {
            variableType.args.push('Dataschema');
          } else {
            variableType.args.push(['Collected', 'Dataschema']);
          }
        } else if (['individual', 'collected'].indexOf(filterBy) > -1) {
          variableType.args.push('Collected');
        } else if (['harmonization', 'harmonized'].indexOf(filterBy) > -1) {
          variableType.args.push('Dataschema');
        }
        var andVariableType = new RqlQuery('and');
        andVariableType.args.push(variableType);
        andVariableType.args.push(variable.args[0]);
        variable.args[0] = andVariableType;
      }

      variable.args.push(aggregate);

      return parsedQuery.serializeArgs(parsedQuery.args);
    };

    this.prepareGraphicsQuery = function (query, aggregateArgs, bucketArgs, ensureIndividualStudies) {
      var parsedQuery = this.parseQuery(query);
      // aggregate
      var aggregate = new RqlQuery(RQL_NODE.AGGREGATE);
      aggregateArgs.forEach(function (a) {
        aggregate.args.push(a);
      });
      //bucket
      if (bucketArgs && bucketArgs.length > 0) {
        var bucket = new RqlQuery(RQL_NODE.BUCKET);
        bucketArgs.forEach(function (b) {
          bucket.args.push(b);
        });
        aggregate.args.push(bucket);
      }

      // study
      var study;
      var hasQuery = false;
      var hasStudyTarget = false;
      parsedQuery.args.forEach(function (arg) {
        if (arg.name === 'study') {
          hasStudyTarget = true;
          var limitIndex = null;
          hasQuery = arg.args.filter(function (requestArg, index) {
            if (requestArg.name === 'limit') {
              limitIndex = index;
            }
            return ['limit', 'sort', 'aggregate'].indexOf(requestArg.name) < 0;
          }).length;
          if (limitIndex !== null) {
            arg.args.splice(limitIndex, 1);
          }
          study = arg;
        }
      });
      // Study match all if no study query.
      if (!hasStudyTarget) {
        study = new RqlQuery('study');
        parsedQuery.args.push(study);
      }
      if (ensureIndividualStudies) {
        // Make sure the graphics query is done on individual studies
        var classNameQuery = findQueryInTargetByVocabulary(study, 'className');
        if (!classNameQuery) {
          classNameQuery = new RqlQuery(RQL_NODE.IN);
          classNameQuery.args = ['Mica_study.className', 'Study'];
          RqlQueryUtils.addQuery(study, classNameQuery);
        } else {
          classNameQuery.args[1] = 'Study';
        }
      }
      else if (!hasQuery) {
        study.args.push(new RqlQuery(RQL_NODE.MATCH));
      }
      study.args.push(aggregate);
      // facet
      parsedQuery.args.push(new RqlQuery('facet'));
      return parsedQuery.serializeArgs(parsedQuery.args);
    };

    this.getTargetAggregations = function (joinQueryResponse, criterion, lang) {

      /**
       * Helper to merge the terms that are not in the aggregation list
       *
       * @param aggs
       * @param vocabulary
       * @returns Array of aggs
       */
      function addMissingTerms(aggs, vocabulary) {
        var terms = vocabulary.terms;
        if (terms && terms.length > 0) {
          var keys = aggs && aggs.map(function (agg) {
            return agg.key;
          }) || [];

          if (aggs) {
            // Add the missing terms not present in the aggs list
            var missingTerms = [];

            terms.forEach(function (term) {
              if (keys.length === 0 || keys.indexOf(term.name) === -1) {
                missingTerms.push({
                  count: 0,
                  default: 0,
                  description: LocalizedValues.forLocale(term.description, lang),
                  key: term.name,
                  title: LocalizedValues.forLocale(term.title, lang)
                });
              }
            });

            return aggs.concat(missingTerms);
          }

          // The query didn't have any match, return default empty aggs based on the vocabulary terms
          return terms.map(function (term) {
            return {
              count: 0,
              default: 0,
              description: LocalizedValues.forLocale(term.description, lang),
              key: term.name,
              title: LocalizedValues.forLocale(term.title, lang)
            };
          });

        }

        return aggs;
      }

      function getChildAggragations(parentAgg, aggKey) {
        if (parentAgg.children) {
          var child = parentAgg.children.filter(function (child) {
            return child.hasOwnProperty(aggKey);
          }).pop();

          if (child) {
            return child[aggKey];
          }
        }

        return null;
      }

      var alias = VocabularyService.vocabularyAlias(criterion.vocabulary);
      var targetResponse = joinQueryResponse[criterion.target + 'ResultDto'];

      if (targetResponse && targetResponse.aggs) {
        var isProperty = criterion.taxonomy.name.startsWith('Mica_');
        var filter = isProperty ? alias : criterion.taxonomy.name;
        var filteredAgg = targetResponse.aggs.filter(function (agg) {
          return agg.aggregation === filter;
        }).pop();

        if (filteredAgg) {
          if (isProperty) {
            if (VocabularyService.isNumericVocabulary(criterion.vocabulary)) {
              return filteredAgg['obiba.mica.StatsAggregationResultDto.stats'];
            } else {
              return VocabularyService.isRangeVocabulary(criterion.vocabulary) ?
                addMissingTerms(filteredAgg['obiba.mica.RangeAggregationResultDto.ranges'], criterion.vocabulary) :
                addMissingTerms(filteredAgg['obiba.mica.TermsAggregationResultDto.terms'], criterion.vocabulary);
            }
          } else {
            var vocabularyAgg = filteredAgg.children.filter(function (agg) {
              return agg.aggregation === alias;
            }).pop();

            if (vocabularyAgg) {
              return VocabularyService.isRangeVocabulary(criterion.vocabulary) ?
                addMissingTerms(getChildAggragations(filteredAgg, 'obiba.mica.RangeAggregationResultDto.ranges'), criterion.vocabulary) :
                addMissingTerms(getChildAggragations(filteredAgg, 'obiba.mica.TermsAggregationResultDto.terms'), criterion.vocabulary);
            }
          }
        }
      }

      return addMissingTerms([], criterion.vocabulary);
    };

    this.findCriterion = function (criteria, id) {
      function inner(criteria, id) {
        var result;
        if (criteria.id === id) { return criteria; }
        var children = criteria.children.filter(function (childCriterion) { return childCriterion instanceof CriteriaItem; });

        for (var i = children.length; i--;) {
          result = inner(children[i], id);

          if (result) { return result; }
        }
      }

      return inner(criteria, id);
    };

    /**
     * Clean a RQL query node from limit, sort, fields, locale nodes.
     *
     * @param rqlRuery The RQL query root node
     * @returns the new query
     */
    this.cleanQuery = function (rqlQuery) {
      var query = angular.copy(rqlQuery);
      if (query.args) {
        // remove limit or sort statements as these will be handled by other clients
        angular.forEach(query.args, function(arg) {
          if (arg.args) {
            var i = arg.args.length;
            while(i--) {
              if (arg.args[i].name === 'limit' || arg.args[i].name === 'sort' || arg.args[i].name === 'fields') {
                arg.args.splice(i, 1);
              }
            }
          }
        });
        // remove empty RQL nodes and locale node
        var i = query.args.length;
        while(i--) {
          if (query.args[i].name === 'locale' || !query.args[i].args || query.args[i].args.length === 0) {
            query.args.splice(i, 1);
          }
        }
      }
      return query;
    };
  }

  ngObibaMica.search.service('RqlQueryService',
    ['$q',
      '$log',
      'TaxonomiesResource',
      'TaxonomyResource',
      'LocalizedValues',
      'VocabularyService',
      'RqlQueryUtils',
      'ngObibaMicaSearch',
      RqlQueryService]);
})();
