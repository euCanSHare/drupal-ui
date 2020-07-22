
class SearchResultSelectionsService {
  private static $inject = ["PaginationService", "$log"];
  private decorators: any;

  constructor(private PaginationService: any, private $log: any) {
    this.decorators = {};
  }

  public decorateSearchResult(type: string, searchResult: any): void {
    if (!this.decorators[type]) {
      this.decorators[type] =
        new SearchResultSelectionsDecorator(QUERY_TARGETS.VARIABLE, this.PaginationService);
    }

    this.decorators[type].decorate(searchResult);
  }

  public getSelections(type: string): any {
    return this.decorators[type] ? this.decorators[type].getSelections() : {};
  }

  public getSelectionIds(type: string): any {
    return this.decorators[type] ? this.decorators[type].getSelectionIds() : {};
  }

  public clearSelections(type: string): any {
    return this.decorators[type] ? this.decorators[type].clearSelections() : {};
  }

}

ngObibaMica.search.service("SearchResultSelectionsService", SearchResultSelectionsService);
