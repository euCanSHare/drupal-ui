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
  function EntitySuggestionService($rootScope,
    $location,
    $translate,
    DocumentSuggestionResource,
    RqlQueryService,
    EntitySuggestionRqlUtilityService,
    AlertService,
    ServerErrorUtils) {

    function suggest(entityType, query) {
      var obibaUtils = new obiba.utils.NgObibaStringUtils();
      var cleanQuery = obibaUtils.cleanDoubleQuotesLeftUnclosed(query);
      cleanQuery = obibaUtils.cleanOrEscapeSpecialLuceneBrackets(cleanQuery);
      cleanQuery = obibaUtils.cleanSpecialLuceneCharacters(cleanQuery);

      if (entityType && query && cleanQuery.length > 1) {
        return DocumentSuggestionResource.query({ locale: $translate.use(), documentType: entityType, query: cleanQuery })
          .$promise
          .then(function (response) {
            var parsedResponse = Array.isArray(response) ? response : [];

            for (var i = 0; i < parsedResponse.length; i++) {
              parsedResponse[i] = obibaUtils.quoteQuery(parsedResponse[i].replace(/\/.*/, ''));
            }

            return parsedResponse;
          }, function (response) {
            AlertService.alert({
              id: 'SearchController',
              type: 'danger',
              msg: ServerErrorUtils.buildMessage(response),
              delay: 5000
            });

          });
      } else {
        return [];
      }
    }

    function suggestForTargetQuery(entityType, query) {
      var rql = RqlQueryService.parseQuery($location.search().query);
      var targetQuery = RqlQueryService.findTargetQuery(typeToTarget(entityType), rql);
      var classNameQuery = RqlQueryService.findQueryInTargetByVocabulary(targetQuery, 'className');
      if (classNameQuery) {
        query = 'className:' + classNameQuery.args[1] + ' AND (' + query.replace(/\/.*/, '') + ')';
      }

      return suggest(entityType, query);
    }

    function getCurrentSuggestion(target, query) {
      if (query) {
        var targetQuery = RqlQueryService.findTargetQuery(target, query);
        if (targetQuery) {
          var matchQuery =
            EntitySuggestionRqlUtilityService
              .givenFilterQueryGetMatchQuery(EntitySuggestionRqlUtilityService.givenTargetQueryGetFilterQuery(targetQuery));

          if (matchQuery && matchQuery.args) {
            if (Array.isArray(matchQuery.args[0]) && matchQuery.args[0].length === 1) {
              return matchQuery.args[0][0];
            } else if (Array.isArray(matchQuery.args[0]) && matchQuery.args[0].length > 1) {
              return matchQuery.args[0].join(',');
            }
  
            return matchQuery.args[0].length ? matchQuery.args[0][0] : '';
          } else {
            return '';
          }          
        }
      }

      return '';
    }

    function selectSuggestion(target, suggestion, withSpecificFields) {
      var obibaUtils = new obiba.utils.NgObibaStringUtils();
      var cleanSuggestion = obibaUtils.cleanDoubleQuotesLeftUnclosed(suggestion);
      cleanSuggestion = obibaUtils.cleanOrEscapeSpecialLuceneBrackets(cleanSuggestion);
      cleanSuggestion = obibaUtils.cleanSpecialLuceneCharacters(cleanSuggestion);

      $rootScope.$new().$emit('ngObibaMicaSearch.searchSuggestion',
        cleanSuggestion, target, withSpecificFields);
    }

    this.getCurrentSuggestion = getCurrentSuggestion;
    this.suggest = suggest;
    this.selectSuggestion = selectSuggestion;
    this.suggestForTargetQuery = suggestForTargetQuery;
  }

  function EntitySuggestionRqlUtilityService() {
    function createMatchQueryArgs(suggestion, filterFields) {
      var args = [];
      args.push([suggestion]);

      // add filterFields
      if (Array.isArray(filterFields)) {
        args.push(filterFields);
      } else if (filterFields) {
        args.push([filterFields]);
      }

      return args;
    }

    function createMatchQuery(suggestion, filterFields) {
      var matchQuery = null;
      var trimmedSuggestion = suggestion.trim();
      if (trimmedSuggestion.length) {
        // add filter as match criteria
        matchQuery = new RqlQuery(RQL_NODE.MATCH);
        matchQuery.args = createMatchQueryArgs(trimmedSuggestion, filterFields);
      }

      return matchQuery;
    }

    function givenTargetQueryGetFilterQuery(targetQuery) {
      if (!targetQuery) {
        return null;
      }
      return targetQuery.args.filter(function (arg) { return arg.name === RQL_NODE.FILTER; }).pop();
    }

    function givenFilterQueryGetMatchQuery(filterQuery) {
      if (!filterQuery) {
        return null;
      }
      return filterQuery.args.filter(function (arg) { return arg.name === RQL_NODE.MATCH; }).pop();
    }

    // use when suggestion is empty or null
    function removeFilteredMatchQueryFromTargetQuery(targetQuery) {
      var filterQuery = givenTargetQueryGetFilterQuery(targetQuery);
      if (!filterQuery) {
        return;
      }

      if (filterQuery.args.length === 1 && filterQuery.args[0].name === RQL_NODE.MATCH) {
        targetQuery.args = targetQuery.args.filter(function (arg) {
          return arg.name !== RQL_NODE.FILTER;
        });
      } else {
        filterQuery.args = filterQuery.args.filter(function (arg) {
          return arg.name !== RQL_NODE.MATCH;
        });
      }
    }

    this.createMatchQuery = createMatchQuery;
    this.givenTargetQueryGetFilterQuery = givenTargetQueryGetFilterQuery;
    this.givenFilterQueryGetMatchQuery = givenFilterQueryGetMatchQuery;
    this.removeFilteredMatchQueryFromTargetQuery = removeFilteredMatchQueryFromTargetQuery;
  }

  ngObibaMica.search.service('EntitySuggestionRqlUtilityService', EntitySuggestionRqlUtilityService);

  ngObibaMica.search
    .service('EntitySuggestionService', [
      '$rootScope',
      '$location',
      '$translate',
      'DocumentSuggestionResource',
      'RqlQueryService', 'EntitySuggestionRqlUtilityService',
      'AlertService',
      'ServerErrorUtils',
      EntitySuggestionService
    ]);

})();