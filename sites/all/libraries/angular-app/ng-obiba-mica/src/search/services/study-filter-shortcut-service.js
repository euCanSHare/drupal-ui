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
  function StudyFilterShortcutService($location, RqlQueryService) {
    function getCurrentClassName(rqlQuery) {
      rqlQuery = rqlQuery || RqlQueryService.parseQuery($location.search().query);
      var targetQuery = RqlQueryService.findTargetQuery(QUERY_TARGETS.STUDY, rqlQuery);
      var className;

      if (targetQuery) {
        className = RqlQueryService.findQueryInTargetByVocabulary(targetQuery, 'className');
      }

      return className;
    }

    function classNameQueryHasArgValue(className, argValue) {
      return !className ||
        (Array.isArray(className.args[1]) ? className.args[1].indexOf(argValue) > -1 : className.args[1] === argValue);
    }

    function classNameQueryHasStudyArg(className) {
      return classNameQueryHasArgValue(className, 'Study');
    }

    function classNameQueryHasHarmonizationStudyArg(className) {
      return classNameQueryHasArgValue(className, 'HarmonizationStudy');
    }

    function classNameQueryIsExists(className) {
      return !className ||
        className.name === RQL_NODE.EXISTS ||
        (classNameQueryHasStudyArg(className) && classNameQueryHasHarmonizationStudyArg(className));
    }

    this.filter = function (choice) {
      var parsedQuery = RqlQueryService.parseQuery($location.search().query);
      var foundStudyClassNameQuery = getCurrentClassName(parsedQuery);
      var studyClassNameQuery;

      if (foundStudyClassNameQuery) {
        studyClassNameQuery = foundStudyClassNameQuery;
        if (studyClassNameQuery.name === RQL_NODE.EXISTS) {
          studyClassNameQuery.name = RQL_NODE.IN;
        }
      } else {
        studyClassNameQuery = new RqlQuery(RQL_NODE.IN);
      }

      studyClassNameQuery.args = ['Mica_study.className'];

      switch (choice) {
        case ngObibaMica.search.STUDY_FILTER_CHOICES.INDIVIDUAL_STUDIES:
          studyClassNameQuery.args.push('Study');
          break;
        case ngObibaMica.search.STUDY_FILTER_CHOICES.HARMONIZATION_STUDIES:
          studyClassNameQuery.args.push('HarmonizationStudy');
          break;
        case ngObibaMica.search.STUDY_FILTER_CHOICES.ALL_STUDIES:
          studyClassNameQuery.args.push(['Study', 'HarmonizationStudy']);
          break;
      }

      if (!foundStudyClassNameQuery) {
        var study = RqlQueryService.findTargetQuery(QUERY_TARGETS.STUDY, parsedQuery);
        if (!study) {
          study = new RqlQuery(QUERY_TARGETS.STUDY);
          parsedQuery.args.push(study);
        }

        if (study.args.length > 0) {
          var replace = study.args.filter(function (arg) {
            return RqlQueryService.isLeaf(arg.name) || RqlQueryService.isOperator(arg.name);
          }).pop();

          if (replace) {
            // replaceable args are operators or leaf nodes
            var andStudyClassName = new RqlQuery(RQL_NODE.AND);
            var index = study.args.indexOf(replace);
            andStudyClassName.args.push(studyClassNameQuery, replace);
            study.args[index] = andStudyClassName;
          } else {
            study.args.push(studyClassNameQuery);
          }
        } else {
          study.args = [studyClassNameQuery];
        }
      }

      $location.search('query', new RqlQuery().serializeArgs(parsedQuery.args));
    };

    this.getStudyClassNameChoices = function () {
      return {
        choseAll: classNameQueryIsExists(getCurrentClassName()),
        choseIndividual: classNameQueryHasStudyArg(getCurrentClassName()),
        choseHarmonization: classNameQueryHasHarmonizationStudyArg(getCurrentClassName())
      };
    };
  }

  ngObibaMica.search.service('StudyFilterShortcutService',
    ['$location', 'RqlQueryService', StudyFilterShortcutService]);
})();