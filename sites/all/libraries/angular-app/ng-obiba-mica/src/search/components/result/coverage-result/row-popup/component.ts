/*
 * Copyright (c) 2019 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

declare var ngObibaMica: any;

class CoverageRowPopupController implements ng.IComponentController {
  private static $inject = ["$log", "$timeout", "$translate"];

  private static MARGIN: number = 15;

  public state: any;

  private element: HTMLElement = null;

  private container: HTMLElement = null;

  private content: string[] = null;

  private headers: string[] = null;

  private headersMap: any = null;

  private timeoutPromise: any = null;

  private visible: boolean = false;

  private scrollHandler: () => void;

  private mouseMoveHandler: () => void;

  constructor(private $log: any, private $timeout: any, private $translate: any) {

  }

  public $onInit() {
    this.container = document.querySelector("#coverage-table-container");
    this.element = document.querySelector("#row-popup");

    // Required for cleaning up the event listeners later, the direct reference to the class listeners and bind
    // does not work well.
    this.scrollHandler = this.onScroll.bind(this);
    this.mouseMoveHandler = this.onMouseMove.bind(this);

    // Cache the column header translations
    const titleKeys: string[] = ["search.coverage-dce-cols.study",
      "search.coverage-dce-cols.population",
      "search.coverage-dce-cols.dce",
      "search.coverage-buckets.dataset",
      "search.coverage-buckets.study",
    ];

    this.headersMap = {};
    this.$translate(titleKeys).then((translations) => {
      this.headersMap.dceId = [translations["search.coverage-dce-cols.study"],
        translations["search.coverage-dce-cols.population"],
        translations["search.coverage-dce-cols.dce"],
      ];
      this.headersMap.datasetId = [translations["search.coverage-buckets.dataset"]];
      this.headersMap.studyId = [translations["search.coverage-buckets.study"]];
    });
  }

  public $onChanges(changes): void {
    if (changes.state.isFirstChange()) {
      return;
    }

    // Set the content without delay so the element dimension are correctly calculated
    if (this.state) {
      this.initContent();
    }

    // Delay until the content is set and the element dimensions are updated
    this.timeoutPromise = this.$timeout(() => {
      if (this.state) {
        this.container.addEventListener("scroll", this.scrollHandler);
        window.addEventListener("mousemove", this.mouseMoveHandler);
        this.onScroll();
      } else {
        this.container.removeEventListener("scroll", this.scrollHandler);
        window.removeEventListener("mousemove", this.mouseMoveHandler);
        this.content = null;
        this.headers = null;
      }
    });

  }

  public $onDestroy() {
    this.$timeout.cancel(this.timeoutPromise);
    this.container.removeEventListener("scroll", this.scrollHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  private onMouseMove(event: MouseEvent): void {
    this.element.style.left = event.clientX  + CoverageRowPopupController.MARGIN + "px";
    this.element.style.top = event.clientY + CoverageRowPopupController.MARGIN + "px";
  }

  private onScroll(): void {
    this.visible =
      this.container.getBoundingClientRect().left > this.state.getElement().children[1].getBoundingClientRect().x;
  }

  private initContent(): void {
    const model: any = this.state.getModel();
    this.content = model.title.trim().split(/:/);
    this.headers = this.headersMap[model.field].slice(0);

    // cleanup content when there are no DCE
    if ("dceId" === model.field && this.content.length < 3) {
      this.headers.pop();
    }
  }
}

class CoverageRowPopupComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string;
  public transclude: boolean;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      state: "<",
    };
    this.controller = CoverageRowPopupController;
    this.controllerAs = "$ctrl";
    this.templateUrl = "search/components/result/coverage-result/row-popup/component.html";
  }
}

ngObibaMica.search
  .component("coverageRowPopup", new CoverageRowPopupComponent());
