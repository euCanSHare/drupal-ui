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

class ReportsProgressBarController implements ng.IComponentController {
  private static $inject = ["$log"];

  public timeline: any;
  public steps: any[];
  public onChange: (args: any) => void;
  private states: any;

  public $onChanges(changes: any): void {
      if (this.timeline) {
        this.steps = [];
        this.steps.push({
          date: this.timeline.startDate,
          marker: "data-access-request.start-label",
          title: "data-access-request.start",
        });
        if (this.timeline.intermediateDates) {
          let i: number;
          for (i = 0; i < this.timeline.intermediateDates.length; i++) {
            this.steps.push({
              date: this.timeline.intermediateDates[i],
              marker: i + 1,
              title: "data-access-request.intermediate",
            });
          }
        }
        this.steps.push({
          date: this.timeline.endDate,
          marker: "data-access-request.end-label",
          title: "data-access-request.end",
        });
      } else {
          this.steps = undefined;
      }
  }

  public isVisible() {
    return this.timeline;
  }

}

class ReportsProgressBarComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string = "access/components/reports-progressbar/component.html";
  public transclude: boolean = false;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      timeline: "<",
    };
    this.controller = ReportsProgressBarController;
    this.controllerAs = "$ctrl";
  }
}

ngObibaMica.access.component("reportsProgressbar", new ReportsProgressBarComponent());
