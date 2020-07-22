'use strict';

(function () {
  function SearchControllerFacetHelperService(MetaTaxonomyService, ngObibaMicaSearch) {
    var metaTaxonomiesPromise = MetaTaxonomyService.getMetaTaxonomiesPromise(),
      options = ngObibaMicaSearch.getOptions(),
      taxonomyNav,
      tabOrderTodisplay,
      facetedTaxonomies,
      hasFacetedTaxonomies;

    function flattenTaxonomies(terms) {
      function termsReducer(accumulator, termsArray) {
        return termsArray.reduce(function (acc, val) {
          if (!Array.isArray(val.terms)) {
            acc.push(val);
            return acc;
          } else {
            return termsReducer(acc, val.terms);
          }
        }, accumulator || []);
      }

      return termsReducer([], terms);
    }

    function doTabOrderToDisplay(targetTabsOrder, lang) {
      return metaTaxonomiesPromise.then(function (metaTaxonomy) {
        taxonomyNav = [];
        tabOrderTodisplay = [];

        targetTabsOrder.forEach(function (target) {
          var targetVocabulary = metaTaxonomy.vocabularies.filter(function (vocabulary) {
            if (vocabulary.name === target) {
              tabOrderTodisplay.push(target);
              return true;
            }
          }).pop();

          if (targetVocabulary && targetVocabulary.terms) {
            targetVocabulary.terms.forEach(function (term) {
              term.target = target;
              var title = term.title.filter(function (t) {
                return t.locale === lang;
              })[0];

              var description = term.description ? term.description.filter(function (t) {
                return t.locale === lang;
              })[0] : undefined;

              term.locale = {
                title: title,
                description: description
              };

              if (term.terms) {
                term.terms.forEach(function (trm) {
                  var title = trm.title.filter(function (t) {
                    return t.locale === lang;
                  })[0];

                  var description = trm.description ? trm.description.filter(function (t) {
                    return t.locale === lang;
                  })[0] : undefined;

                  trm.locale = {
                    title: title,
                    description: description
                  };
                });
              }

              taxonomyNav.push(term);
            });
          }
        });
      });
    }

    function doFacetedTaxonomies() {
      return metaTaxonomiesPromise.then(function (metaTaxonomy) {
        facetedTaxonomies = {};
        hasFacetedTaxonomies = false;

        metaTaxonomy.vocabularies.reduce(function (accumulator, target) {
          var taxonomies = flattenTaxonomies(target.terms);

          function getTaxonomy(taxonomyName) {
            return taxonomies.filter(function (taxonomy) {
              return taxonomy.name === taxonomyName;
            })[0];
          }

          function notNull(value) {
            return value !== null && value !== undefined;
          }

          if (options.showAllFacetedTaxonomies) {
            accumulator[target.name] = taxonomies.filter(function (taxonomy) {
              return taxonomy.attributes && taxonomy.attributes.some(function (attribute) {
                return attribute.key === 'showFacetedNavigation' && attribute.value.toString() === 'true';
              });
            });
          } else {
            accumulator[target.name] = (options[target.name + 'TaxonomiesOrder'] || []).map(getTaxonomy).filter(notNull);
          }

          hasFacetedTaxonomies = hasFacetedTaxonomies || accumulator[target.name].length;

          return accumulator;
        }, facetedTaxonomies);
      });
    }

    function getTaxonomyNav() {
      return taxonomyNav;
    }

    function getFacetedTaxonomies() {
      return facetedTaxonomies;
    }

    function getTabOrderTodisplay() {
      return tabOrderTodisplay;
    }

    function getHasFacetedTaxonomies() {
      return hasFacetedTaxonomies;
    }

    function help(targetTabsOrder, lang) {
      return Promise.all([doFacetedTaxonomies(), doTabOrderToDisplay(targetTabsOrder, lang)]).then(function () {
        return {
          getTaxonomyNav: getTaxonomyNav,
          getFacetedTaxonomies: getFacetedTaxonomies,
          getTabOrderTodisplay: getTabOrderTodisplay,
          getHasFacetedTaxonomies: getHasFacetedTaxonomies
        };
      });
    }

    this.help = help;
  }

  ngObibaMica.search.service('SearchControllerFacetHelperService', ['MetaTaxonomyService', 'ngObibaMicaSearch', SearchControllerFacetHelperService]);
})();