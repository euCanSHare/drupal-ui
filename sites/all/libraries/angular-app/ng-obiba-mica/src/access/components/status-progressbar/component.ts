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

class StatusProgressBarController implements ng.IComponentController {
  private static $inject = ["$log"];

  public status: string;
  public history: any[];
  public config: any;
  public steps: any[];
  public onChange: (args: any) => void;
  private states: any;

  public $onChanges(changes: any): void {
    if (this.status && this.config) {

      if (!this.states) {
        this.initializeStates();
      }

      this.updateStatusSteps();
    }
  }

  public isVisible() {
    return this.status !== "APPROVED";
  }

  private initializeStates(): void {
    let i = 1;
    this.states = {};
    this.states.OPENED = i++;
    if (true === this.config.withConditionalApproval) {
      this.states.CONDITIONALLY_APPROVED = this.states.OPENED;
    }
    this.states.SUBMITTED = i++;
    if (true === this.config.withReview) {
      this.states.REVIEWED = i++;
    }

    this.states.APPROVED = this.states.REJECTED = i;
  }

  private updateStatusSteps(): void {
    this.steps = new Array();
    if (this.status === "CONDITIONALLY_APPROVED") {
      this.steps.push({
        date: this.findStatusChangeDate("CONDITIONALLY_APPROVED"),
        done: true,
        marker: this.states.CONDITIONALLY_APPROVED,
        title: "CONDITIONALLY_APPROVED",
      });
    } else {
      this.steps.push({
        date: this.findStatusChangeDate("OPENED"),
        done: true,
        marker: this.states.OPENED,
        title: "OPENED",
      });
    }
    const submittedDone = this.states[this.status] >= this.states.SUBMITTED;
    this.steps.push({
      date: submittedDone ? this.findStatusChangeDate("SUBMITTED") : undefined,
      done: submittedDone,
      marker: this.states.SUBMITTED,
      title: "SUBMITTED",
    });
    const reviewedDone = this.states[this.status] >= this.states.REVIEWED;
    if (true === this.config.withReview) {
      this.steps.push({
        date: reviewedDone ? this.findStatusChangeDate("REVIEWED") : undefined,
        done: reviewedDone,
        marker: this.states.REVIEWED,
        title: "REVIEWED",
      });
    }
    if (this.status === "REJECTED") {
      this.steps.push({
        date: this.findStatusChangeDate("REJECTED"),
        done: true,
        marker: this.states.REJECTED,
        title: "REJECTED",
      });
    } else if (this.status === "APPROVED") {
      this.steps.push({
        date: this.findStatusChangeDate("APPROVED"),
        done: true,
        marker: this.states.APPROVED,
        title: "APPROVED",
      });
    } else {
      this.steps.push({
        done: false,
        marker: this.states.APPROVED,
        title: "APPROVED-REJECTED",
      });
    }
  }

  private findStatusChangeDate(status: string) {
      if (this.history) {
        if (status === "OPENED") {
          // creation
          return this.history[0].changedOn;
        } else {
          // reverse inspection
          let i: number;
          for (i = this.history.length; i > 0; i--) {
            const change = this.history[i - 1];
            if (change.to === status) {
              return change.changedOn;
            }
          }
        }
      }
  }
}

class StatusProgressBarComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string = "access/components/status-progressbar/component.html";
  public transclude: boolean = false;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      config: "<",
      history: "<",
      status: "<",
    };
    this.controller = StatusProgressBarController;
    this.controllerAs = "$ctrl";
  }
}

ngObibaMica.access.component("statusProgressbar", new StatusProgressBarComponent());
