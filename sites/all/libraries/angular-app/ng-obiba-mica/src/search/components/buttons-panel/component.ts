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

class ButtonsPanelController implements ng.IComponentController {
  private static $inject = ["$log", "$rootScope", "$translate"];

  public showPanel: boolean = true;
  public isFullscreen = false;

  public onToggleLeftPanelVisibility: (args: any) => void;
  public onToggleFullscreen: (args: any) => void;

  private showIconForPanelButton: boolean = false;
  private showIconForFullscreenButton: boolean = false;

  constructor(private $log: any, private $rootScope: any, private $translate: any) {
    this.$rootScope.$on("ngObibaMicaSearch.fullscreenChange", (event, isEnabled) => {
      this.isFullscreen = isEnabled;
      this.onToggleFullscreen({fullscreen: this.isFullscreen});
    });
    this.$rootScope.$on("$translateChangeSuccess", () => this.ensureButtonTitles());
  }

  public toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    this.onToggleFullscreen({fullscreen: this.isFullscreen});
  }

  public toggleLeftPanelVisibility(): void {
    this.showPanel = !this.showPanel;
    this.onToggleLeftPanelVisibility({visible: this.showPanel});
    this.$rootScope.$broadcast("ngObibaMicaLeftPaneToggle", this.showPanel);
  }

  public $onInit() {
    this.ensureButtonTitles();
  }

  private ensureButtonTitles() {
    const keys = [
      "search.left-panel-close-title",
      "search.left-panel-open-title",
      "search.enter-fullscreen-title",
      "search.exit-fullscreen-title"];

    this.$translate(keys).then((translations) => {
      this.showIconForFullscreenButton =
        "" !== translations["search.enter-fullscreen-title"] &&
        translations["search.enter-fullscreen-title"] !== "search.enter-fullscreen-title" &&
        "" !== translations["search.exit-fullscreen-title"] &&
        translations["search.exit-fullscreen-title"] !== "search.exit-fullscreen-title" ;

      this.showIconForPanelButton =
        "" !== translations["search.left-panel-open-title"] &&
        translations["search.left-panel-open-title"] !== "search.left-panel-open-title" &&
        "" !== translations["search.left-panel-close-title"] &&
        translations["search.left-panel-close-title"] !== "search.left-panel-close-title";
    });
  }
}

class ButtonsPanelComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string;
  public transclude: boolean;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      onToggleFullscreen: "&",
      onToggleLeftPanelVisibility: "&",
    };
    this.controller = ButtonsPanelController;
    this.controllerAs = "$ctrl";
    this.templateUrl = "search/components/buttons-panel/component.html";
  }
}

ngObibaMica.search
  .component("buttonsPanelComponent", new ButtonsPanelComponent());
