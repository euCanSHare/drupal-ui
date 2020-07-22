/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

class SearchResultPaginationController implements ng.IComponentController {
  private static $inject = ["PaginationService"];

  public showTotal: boolean;
  public target: string;
  public onChange: (args: any) => void;
  public pagination: any;
  public showPaginationTotal: boolean;
  private preventPageChangeEvent: boolean = false;

  constructor(private PaginationService: any) {
  }

  public onUpdate(state: any, preventPageChangeEvent: boolean): void {
    this.preventPageChangeEvent = preventPageChangeEvent;
    this.pagination = state;
    this.showPaginationTotal = this.showTotal === true && this.pagination.pageCount > 1;
  }

  public pageChanged(): void {
    this.onChange({
      from: (this.pagination.currentPage - 1) * this.pagination.selected.value,
      replace: true === this.preventPageChangeEvent,
      size: this.pagination.selected.value,
      target: this.target,
    });
  }

  public pageSizeChanged(): void {
    this.pageChanged();
  }

  public $onInit(): void {
    this.PaginationService.registerListener(this.target, this);
  }
}

class SearchResultPaginationComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string = "search/components/result/pagination/component.html";
  public transclude: boolean = false;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      onChange: "&",
      showTotal: "<",
      target: "<",
    };
    this.controller = SearchResultPaginationController;
    this.controllerAs = "$ctrl";
  }
}

ngObibaMica.search.component ("searchResultPagination", new SearchResultPaginationComponent());
