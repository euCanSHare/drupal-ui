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

  function RqlQueryUtils(VocabularyService) {

    /**
     * Finds the parent node to which new queries can be added
     *
     * @param targetNode
     * @returns {*}
     */
    function findValidParentNode(targetNode) {
      var target = targetNode.args.filter(function (query) {
        switch (query.name) {
          case RQL_NODE.AND:
          case RQL_NODE.NAND:
          case RQL_NODE.OR:
          case RQL_NODE.NOR:
          case RQL_NODE.NOT:
          case RQL_NODE.CONTAINS:
          case RQL_NODE.IN:
          case RQL_NODE.OUT:
          case RQL_NODE.EQ:
          case RQL_NODE.GT:
          case RQL_NODE.GE:
          case RQL_NODE.LT:
          case RQL_NODE.LE:
          case RQL_NODE.BETWEEN:
          case RQL_NODE.EXISTS:
          case RQL_NODE.MISSING:
            return true;
          case RQL_NODE.MATCH:
            return query.args.length > 1;
        }

        return false;
      }).pop();

      if (target) {
        return targetNode.args.findIndex(function (arg) {
          return arg.name === target.name;
        });
      }

      return -1;
    }

    function vocabularyTermNames(vocabulary) {
      return vocabulary && vocabulary.terms ? vocabulary.terms.map(function (term) {
        return term.name;
      }) : [];
    }

    function hasTargetQuery(rootRql, target) {
      return rootRql.args.filter(function (query) {
        switch (query.name) {
          case RQL_NODE.VARIABLE:
          case RQL_NODE.DATASET:
          case RQL_NODE.STUDY:
          case RQL_NODE.NETWORK:
            return target ? target === query.name : true;
          default:
            return false;
        }
      }).length > 0;
    }

    function variableQuery() {
      return new RqlQuery(QUERY_TARGETS.VARIABLE);
    }

    function eqQuery(field, term) {
      var query = new RqlQuery(RQL_NODE.EQ);
      query.args.push(term);
      return query;
    }

    function orQuery(left, right) {
      var query = new RqlQuery(RQL_NODE.OR);
      query.args = [left, right];
      return query;
    }

    function aggregate(fields) {
      var query = new RqlQuery(RQL_NODE.AGGREGATE);
      fields.forEach(function (field) {
        query.args.push(field);
      });
      return query;
    }

    function fields(fieldsQuery) {
      var query = new RqlQuery(RQL_NODE.FIELDS);
      query.args.push(fieldsQuery);
      return query;
    }

    function limit(from, size) {
      var query = new RqlQuery(RQL_NODE.LIMIT);
      query.args.push(from);
      query.args.push(size);
      return query;
    }

    function fieldQuery(name, field, terms) {
      var query = new RqlQuery(name);
      query.args.push(field);

      if (terms && terms.length > 0) {
        query.args.push(terms);
      }

      return query;
    }

    function inQuery(field, terms) {
      var hasValues = terms && terms.length > 0;
      var name = hasValues ? RQL_NODE.IN : RQL_NODE.EXISTS;
      return fieldQuery(name, field, terms);
    }

    function matchQuery(field, queryString) {
      var query = new RqlQuery(RQL_NODE.MATCH);
      query.args.push(queryString || '*');
      query.args.push(field);
      return query;
    }

    function isFreeTextMatch(query) {
      return query.name === RQL_NODE.MATCH && query.args.length === 1;
    }

    function updateMatchQuery(query, queryString) {
      query.args[0] = queryString || '*';
      return query;
    }

    function rangeQuery(field, from, to) {
      var query = new RqlQuery(RQL_NODE.BETWEEN);
      query.args.push(field);
      updateRangeQuery(query, from, to);
      return query;
    }

    function updateQueryInternal(query, terms) {
      var hasValues = terms && terms.length > 0;

      if (hasValues) {
        query.args[1] = terms;
      } else {
        query.args.splice(1, 1);
      }

      return query;
    }

    function mergeInQueryArgValues(query, terms, replace) {
      var hasValues = terms && terms.length > 0;

      if (hasValues) {
        var current = query.args[1];

        if (!current || replace) {
          query.args[1] = terms;
        } else {
          if (!(current instanceof Array)) {
            current = [current];
          }

          var unique = terms.filter(function (term) {
            return current.indexOf(term) === -1;
          });

          query.args[1] = current.concat(unique);
        }
      } else {
        query.args.splice(1, 1);
      }

      return query;
    }

    function updateRangeQuery(query, from, to, missing) {
      if (missing) {
        query.name = RQL_NODE.MISSING;
        query.args.splice(1, 1);
      } else if (angular.isDefined(from) && from !== null && angular.isDefined(to) && to !== null) {
        query.name = RQL_NODE.BETWEEN;
        query.args[1] = [from, to];
      } else if (angular.isDefined(from) && from !== null) {
        query.name = RQL_NODE.GE;
        query.args[1] = from;
      } else if (angular.isDefined(to) && to !== null) {
        query.name = RQL_NODE.LE;
        query.args[1] = to;
      } else {
        query.name = RQL_NODE.EXISTS;
        query.args.splice(1, 1);
      }
    }

    /**
     * Creates a RqlQuery from an item
     *
     * @param item
     * @returns {RqlQuery}
     */
    function buildRqlQuery(item) {
      if (VocabularyService.isNumericVocabulary(item.vocabulary)) {
        return rangeQuery(criteriaId(item.taxonomy, item.vocabulary), null, null);
      } else if (VocabularyService.isMatchVocabulary(item.vocabulary)) {
        return matchQuery(criteriaId(item.taxonomy, item.vocabulary), null);
      } else {
        var args;
        if (Array.isArray(item.selectedTerms) && item.selectedTerms.length > 0) {
          args = item.selectedTerms;
        } else if (item.term) {
          args = item.term.name;
        }

        return inQuery(
          criteriaId(item.taxonomy, item.vocabulary),
          args
        );
      }
    }

    /**
     * Adds a new query to the parent query node
     *
     * @param parentQuery
     * @param query
     * @returns {*}
     */
    function addQuery(parentQuery, query, logicalOp) {
      if (parentQuery.args.length === 0) {
        parentQuery.args.push(query);
      } else {
        var parentIndex = findValidParentNode(parentQuery);

        if (parentIndex === -1) {
          parentQuery.args.push(query);
        } else {
          var oldArg = parentQuery.args.splice(parentIndex, 1).pop();
          // check if the field is from the target's taxonomy, in which case the criteria is
          // added with a AND operator otherwise it is a OR
          if (!logicalOp && query.args && query.args.length > 0) {
            var targetTaxo = 'Mica_' + parentQuery.name;

            if (!isFreeTextMatch(query)) {
              var criteriaVocabulary = query.name === 'match' ? query.args[1] : query.args[0];
              logicalOp = criteriaVocabulary.startsWith(targetTaxo + '.') ? RQL_NODE.AND : RQL_NODE.OR;
            }
          }
          var orQuery = new RqlQuery(logicalOp || RQL_NODE.AND);
          orQuery.args.push(oldArg, query);
          parentQuery.args.push(orQuery);
        }
      }

      return parentQuery;
    }

    /**
     * Update repeatable vocabularies as follows:
     *
     * IN(q, [a,b]) OR [c] => CONTAINS(q, [a,c]) OR CONTAINS(q, [b,c])
     * CONTAINS(q, [a,b]) OR [c] => CONTAINS(q, [a,b,c])
     * EXISTS(q) OR [c] => CONTAINS(q, [c])
     *
     * @param existingItemWrapper
     * @param terms
     */
    function updateRepeatableQueryArgValues(existingItem, terms) {
      existingItem.items().forEach(function (item) {
        var query = item.rqlQuery;
        switch (query.name) {
          case RQL_NODE.EXISTS:
            query.name = RQL_NODE.CONTAINS;
            mergeInQueryArgValues(query, terms, false);
            break;

          case RQL_NODE.CONTAINS:
            mergeInQueryArgValues(query, terms, false);
            break;

          case RQL_NODE.IN:
            var values = query.args[1] ? [].concat(query.args[1]) : [];
            if (values.length === 1) {
              query.name = RQL_NODE.CONTAINS;
              mergeInQueryArgValues(query, terms, false);
              break;
            }

            var field = query.args[0];
            var contains = values.filter(function (value) {
              // remove duplicates (e.g. CONTAINS(q, [a,a])
              return terms.indexOf(value) < 0;
            }).map(function (value) {
              return fieldQuery(RQL_NODE.CONTAINS, field, [].concat(value, terms));
            });

            var orRql;
            if (contains.length > 1) {
              var firstTwo = contains.splice(0, 2);
              orRql = orQuery(firstTwo[0], firstTwo[1]);

              contains.forEach(function (value) {
                orRql = orQuery(value, orRql);
              });

              query.name = orRql.name;
              query.args = orRql.args;
            } else {
              query.name = RQL_NODE.CONTAINS;
              query.args = contains[0].args;
            }
        }
      });
    }

    function updateQueryArgValues(query, terms, replace) {
      switch (query.name) {
        case RQL_NODE.EXISTS:
        case RQL_NODE.MISSING:
          query.name = RQL_NODE.IN;
          mergeInQueryArgValues(query, terms, replace);
          break;
        case RQL_NODE.CONTAINS:
        case RQL_NODE.IN:
          mergeInQueryArgValues(query, terms, replace);
          break;
        case RQL_NODE.BETWEEN:
        case RQL_NODE.GE:
        case RQL_NODE.LE:
          query.args[1] = terms;
          break;
        case RQL_NODE.MATCH:
          query.args[0] = terms;
          break;
      }
    }

    function updateQuery(query, values) {
      switch (query.name) {
        case RQL_NODE.CONTAINS:
        case RQL_NODE.IN:
        case RQL_NODE.OUT:
        case RQL_NODE.EXISTS:
        case RQL_NODE.MISSING:
          updateQueryInternal(query, values);
          break;
      }
    }

    function addLocaleQuery(rqlQuery, locale) {
      var found = rqlQuery.args.filter(function (arg) {
        return arg.name === RQL_NODE.LOCALE;
      }).pop();

      if (!found) {
        var localeQuery = new RqlQuery('locale');
        localeQuery.args.push(locale);
        rqlQuery.args.push(localeQuery);
      }
    }

    function addFields(targetQuery, fieldsQuery) {
      if (targetQuery && targetQuery.args) {
        var found = targetQuery.args.filter(function (arg) {
          return arg.name === RQL_NODE.FIELDS;
        }).pop();

        if (found) {
          found.args = fieldsQuery.args;
        } else {
          targetQuery.args.push(fieldsQuery);
        }
      }
    }

    function getLimitQuery(targetQuery) {
      if (targetQuery && targetQuery.args) {
        return targetQuery.args.filter(function (arg) {
          return arg.name === RQL_NODE.LIMIT;
        }).pop();
      }
      return null;
    }

    function addLimit(targetQuery, limitQuery) {
      if (targetQuery && targetQuery.args) {
        var found = getLimitQuery(targetQuery);
        if (found) {
          found.args = limitQuery.args;
        } else {
          targetQuery.args.push(limitQuery);
        }
      }
    }

    /**
     * Adds a sort criteria on given fields
     *
     * @param targetQuery
     * @param sort field name or an array of field names
     */
    function addSort(targetQuery, sort) {
      var sortQuery = targetQuery.args.filter(function (arg) {
        return arg.name === RQL_NODE.SORT;
      }).pop();

      if (!sortQuery) {
        sortQuery = new RqlQuery('sort');
        targetQuery.args.push(sortQuery);
      }

      sortQuery.args = Array.isArray(sort) ? sort : [sort];
    }

    /**
     * Helper finding the vocabulary field, return name if none was found
     *
     * @param taxonomy
     * @param vocabulary
     * @returns {*}
     */
    function criteriaId(taxonomy, vocabulary) {
      return taxonomy.name + '.' + vocabulary.name;
    }

    function rewriteQueryWithLimitAndFields(parsedQuery, target, maximumLimit, fieldsArray) {
      var targetQuery = parsedQuery.args.filter(function (query) {
        return query.name === target;
      }).pop();

      addLimit(targetQuery, limit(0, maximumLimit));

      if (fieldsArray) {
        addFields(targetQuery, fields(fieldsArray));
      }

      return new RqlQuery().serializeArgs(parsedQuery.args);
    }

    function createSelectionsQuery(parsedQuery, target, maximumLimit, fieldsArray, selections) {
      var localeQuery = parsedQuery.args.filter(function (query) {
        return query.name === RQL_NODE.LOCALE;
      }).pop();

      var currentTargetQuery = parsedQuery.args.filter(function (query) {
        return query.name === target;
      }).pop();

      addLimit(currentTargetQuery, limit(0, maximumLimit));

      if (fieldsArray) {
        addFields(currentTargetQuery, fields(fieldsArray));
      }

      var ids = selections.slice(0, maximumLimit);
      var rootQuery = new RqlQuery(RQL_NODE.AND);
      if (Array.isArray(ids) && ids.length) {
        var targetQuery = new RqlQuery(target);
        targetQuery.args.push(inQuery('id', ids));

        // steal required properties from current target query
        currentTargetQuery.args.forEach(function (arg) {
          if (['fields', 'limit', 'sort'].indexOf(arg.name) > -1) {
            targetQuery.args.push(arg);
          }
        });

        rootQuery.args.push(targetQuery);
      } else {
        rootQuery.args.push(currentTargetQuery);
      }


      if (localeQuery) {
        rootQuery.args.push(localeQuery);
      }

      if (selections.length === 0) {
        var otherQueries = parsedQuery.args.filter(function (query) {
          return query.name !== RQL_NODE.LOCALE && query.name !== target;
        });

        rootQuery.args = rootQuery.args.concat(otherQueries);
      }

      return decodeURIComponent(new RqlQuery().serializeArgs(rootQuery.args));
    }

    // exports
    this.vocabularyTermNames = vocabularyTermNames;
    this.hasTargetQuery = hasTargetQuery;
    this.variableQuery = variableQuery;
    this.eqQuery = eqQuery;
    this.orQuery = orQuery;
    this.aggregate = aggregate;
    this.fields = fields;
    this.limit = limit;
    this.fieldQuery = fieldQuery;
    this.inQuery = inQuery;
    this.matchQuery = matchQuery;
    this.isFreeTextMatch = isFreeTextMatch;
    this.updateMatchQuery = updateMatchQuery;
    this.rangeQuery = rangeQuery;
    this.updateQueryInternal = updateQueryInternal;
    this.mergeInQueryArgValues = mergeInQueryArgValues;
    this.updateRangeQuery = updateRangeQuery;
    this.buildRqlQuery = buildRqlQuery;
    this.addQuery = addQuery;
    this.updateRepeatableQueryArgValues = updateRepeatableQueryArgValues;
    this.updateQueryArgValues = updateQueryArgValues;
    this.updateQuery = updateQuery;
    this.addLocaleQuery = addLocaleQuery;
    this.addFields = addFields;
    this.getLimitQuery = getLimitQuery;
    this.addLimit = addLimit;
    this.addSort = addSort;
    this.criteriaId = criteriaId;
    this.rewriteQueryWithLimitAndFields = rewriteQueryWithLimitAndFields;
    this.createSelectionsQuery = createSelectionsQuery;
  }

  ngObibaMica.search.service('RqlQueryUtils', ['VocabularyService', RqlQueryUtils]);

})();