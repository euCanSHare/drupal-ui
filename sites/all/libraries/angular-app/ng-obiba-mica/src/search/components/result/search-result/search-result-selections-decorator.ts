/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class SearchResultSelectionsDecorator extends AbstractSelectionsDecorator {
  private PaginationService: any;

  constructor(documentType: string, PaginationService: any) {
    super(documentType);
    this.PaginationService = PaginationService;
    this.PaginationService.registerListener(this.documentType, this);
  }

  public decorate(component: any): void {
    super.decorate(component);
    this.component.select = this.select.bind(this);
    this.component.selectPage = this.selectPage.bind(this);
    this.component.selectAll = this.selectAll.bind(this);
  }

  public getSelections() {
    return this.component.page.all ? [] : super.getSelections();
  }

  public getSelectionIds() {
    return this.component.page.all ? [] : super.getSelectionIds();
  }

  public update() {
    if (this.component.selections) {
      Object.keys(this.component.selections)
        .forEach((id) => this.component.selections[id]
          ? this.component.selections[id] = true
          : delete this.component.selections[id]);
    }
  }

  public selectPage(): void {
    this.selectPageInternal(this.component.page.selections[this.component.pagination.currentPage]);
  }

  public select(id: string): void {
    const selected = this.component.selections[id];
    const currentPageSelected = this.component.page.selections[this.component.pagination.currentPage];

    if (selected) {
      const pageSelected = this.component.summaries
        .reduce((acc, val) => acc && this.component.selections[val.id], true);

      if (pageSelected) {
        this.component.page.selections[this.component.pagination.currentPage] = true;
      }
    } else {

      if (currentPageSelected) {

        if (this.component.page.all) {
          // remove all selections
          this.component.page.all = false;
        }

        // due to clearing selections above, reselect the page that was already selected
        this.selectPageInternal(currentPageSelected);

        delete this.component.page.selections[this.component.pagination.currentPage];
      }

      delete this.component.selections[id];
    }
  }

  public selectAll(): void {
    this.component.page.all = !this.component.page.all;

    if (this.component.page.all) {
      this.selectPageInternal(this.component.page.all);
    } else {
      this.clearSelections();
    }
  }

  public onUpdate(state: any) {
    const currentPagination = this.component.pagination;
    this.component.pagination = state;

    if (currentPagination) {
      if (currentPagination.pageCount !== state.pageCount) {
        // page size has changed, reset selections
        this.clearSelections();
      } else if (currentPagination.currentPage !== state.currentPage) {
        if (this.component.page.all) {
          this.selectPageInternal(this.component.page.all);
        }
      }
    }

  }

  private selectPageInternal(checked: boolean) {
    if (checked) {
      this.component.page.selections[this.component.pagination.currentPage] = checked;
    } else {
      this.component.page.all = false;
      delete this.component.page.selections[this.component.pagination.currentPage];
    }

    this.component.summaries.forEach((summary) => checked
      ? this.component.selections[summary.id] = checked
      : delete this.component.selections[summary.id]);
  }
}
