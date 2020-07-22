/*
 * Copyright (c) 2019 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

declare var QUERY_TARGETS: any;
declare var RQL_NODE: any;
declare var RqlQuery: any;

/**
 * Helper class that updates the root RqlQuery. Client code can either execute the modified version or retrieve as a
 * string.*
 */
class RqlQueryUpdater {

  private static getQueryTaxonomyAndVocabulary(query: any): any {
    const parts = query.args[0].split(".");
    let taxonomy: string = null;
    let vocabulary: string = null;

    if (parts.length > 1) {
      taxonomy = parts[0];
      vocabulary = parts[1];
    } else {
      vocabulary = parts[0];
    }

    return {taxonomy, vocabulary};
  }

  private parsedQuery: any;
  private type: string;
  private display: string;

  constructor(private $location: any,
              private $filter: any,
              private $translate: any,
              private RqlQueryService: any,
              private AlertService: any,
              private TaxonomyService: any,
              private LocalizedValues: any) {
  }

  /**
   * Prepare the updater before adding/updating RqlQueries
   *
   * @param query - if null the browser query param is parsed
   * @param type - one of QUERY_TARGETS
   * @param display - one of DISPLAY_TYPES
   */
  public prepare(query: string, type: string, display: string): RqlQueryUpdater {
    if (query === null) {
      this.parsedQuery = this.RqlQueryService.parseQuery(this.$location.search().query);
    } else {
      this.parsedQuery = this.RqlQueryService.parseQuery(query);
    }

    this.type = type;
    this.display = display;

    return this;
  }

  /**
   * Updated the parsed query by adding or updating an existing RqlQuery
   *
   * @param target
   * @param newQuery
   * @param andQuery - used for MUST queries
   * @param showNotification
   */
  public update(target: string, newQuery: any, andQuery: boolean, showNotification: boolean): RqlQueryUpdater {
    const targetQuery = this.ensureTarget(target);
    let query = this.findQueryInTarget(targetQuery, newQuery);
    let isNewQuery = false;

    if (query) {
      this.replaceQuery(query, newQuery);
    } else {
      isNewQuery = true;
      this.insertNewQuery(targetQuery, newQuery);
      query = newQuery;
    }

    if (showNotification) {
      this.notify(targetQuery, query, isNewQuery);
    }

    if (andQuery && targetQuery.args.length > 0) {
      const parent: any = this.findParentQuery(targetQuery, query);
      if (parent && this.RqlQueryService.isOperator(parent.name)) {
        parent.name = RQL_NODE.AND;
      }
    }

    return this;
  }

  /**
   * Executes the query by updating the window.location query params
   */
  public execute(): void {
    if (this.type) {
      this.$location.search("type", this.type).replace();
    }

    if (this.display) {
      this.$location.search("display", this.display).replace();
    }

    this.$location.search("query", new RqlQuery().serializeArgs(this.parsedQuery.args));
  }

  /**
   * Returns the parsed query along with query and display types as query params
   */
  public asQueryParams(): string {
    const asParam = (key, value) => key + "=" + value;

    return asParam("query", new RqlQuery().serializeArgs(this.parsedQuery.args)) + "&"
      + (this.type ? asParam("type", this.type) + "&" : "")
      + (this.display ? asParam("display", this.display) : "");
  }

  private ensureTarget(target: string) {
    let targetQuery = this.RqlQueryService.findTargetQuery(target, this.parsedQuery);
    if (!targetQuery) {
      targetQuery = new RqlQuery(target);
      this.parsedQuery.args.push(targetQuery);
    }

    return targetQuery;
  }

  private findQueryInTarget(targetQuery: any, query: any): any {
    const result = RqlQueryUpdater.getQueryTaxonomyAndVocabulary(query);
    return this.RqlQueryService.findQueryInTargetByTaxonomyVocabulary(targetQuery, result.taxonomy, result.vocabulary);
  }

  private notify(targetQuery: any, query: any, isNewQuery: boolean): void {
    const target: string = targetQuery.name;
    const result: any = RqlQueryUpdater.getQueryTaxonomyAndVocabulary(query);
    this.TaxonomyService.getTaxonomy(target, result.taxonomy).then((taxonomy) => {
      (taxonomy.vocabularies || []).some((vocabulary) => {
        if (vocabulary.name === result.vocabulary) {
          const msgKey = isNewQuery ? "search.criterion.created" : "search.criterion.updated";
          this.AlertService.growl({
            delay: 3000,
            id: "SearchControllerGrowl",
            msgArgs: [
              this.LocalizedValues.forLocale(vocabulary.title, this.$translate.use()),
              this.$filter("translate")("taxonomy.target." + target),
            ],
            msgKey,
            type: "info",
          });

          return true;
        }

        return false;
      });
    });
  }

  private insertNewQuery(targetQuery: any, newQuery: any): void {
    if (targetQuery.args.length > 0) {
      const replace = targetQuery.args.filter((arg) => {
        return this.RqlQueryService.isLeaf(arg.name) || this.RqlQueryService.isOperator(arg.name);
      }).pop();

      if (replace) {
        // replaceable args are operators or leaf nodes
        const andStudyClassName = new RqlQuery(RQL_NODE.AND);
        const index = targetQuery.args.indexOf(replace);
        andStudyClassName.args.push(newQuery, replace);
        targetQuery.args[index] = andStudyClassName;
      } else {
        targetQuery.args.push(newQuery);
      }
    } else {
      targetQuery.args = [newQuery];
    }
  }

  private replaceQuery(query, newQuery): void {
    query.name = newQuery.name;
    query.args = newQuery.args;
  }

  private findParentQuery(targetQuery, query) {
    const result = {parent: null};
    this.search(targetQuery, query, result);
    return result.parent;
  }

  private search(parent, query, result): void {
    return parent.args.some((arg) => {
      if (arg === query) {
        result.parent = parent;
        return true;
      }

      if (arg instanceof RqlQuery) {
        return this.search(arg, query, result);
      }

      return false;
    });
  }

}

class RqlQueryUpdaterFactory {

  constructor(private $location: any,
              private $filter: any,
              private $translate: any,
              private RqlQueryService: any,
              private AlertService: any,
              private TaxonomyService: any,
              private LocalizedValues: any) {
  }

  public create(query: string, type: string, display: string): RqlQueryUpdater {
    return new RqlQueryUpdater(
      this.$location,
      this.$filter,
      this.$translate,
      this.RqlQueryService,
      this.AlertService,
      this.TaxonomyService,
      this.LocalizedValues,
    ).prepare(query, type, display);
  }
}

ngObibaMica.search.factory("RqlQueryUpdaterFactory",
  ["$location", "$filter", "$translate", "RqlQueryService", "AlertService", "TaxonomyService", "LocalizedValues",
    ($location, $filter, $translate, RqlQueryService, AlertService, TaxonomyService, LocalizedValues) =>
      new RqlQueryUpdaterFactory(
        $location,
        $filter,
        $translate,
        RqlQueryService,
        AlertService,
        TaxonomyService,
        LocalizedValues),
  ]);
