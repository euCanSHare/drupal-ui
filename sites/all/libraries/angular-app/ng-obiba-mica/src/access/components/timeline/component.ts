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

class TimelineController implements ng.IComponentController {
    private static $inject = ["$log"];

    public onChange: (args: any) => void;
    public steps: any;
    public stepWidth: number;

    public $onChanges(changes: any): void {
        if (this.steps) {
            this.stepWidth = 100 / this.steps.length;
        }
    }

    public getContent(step: any) {
        if (step.date) {
            return this.toLocaleDateString(step.date);
        } else {
            return step.content;
        }
    }

    public isDone(step: any) {
        if (step.date) {
            return Date.parse(step.date) <= Date.now();
        } else {
            return step.done;
        }
    }

    private toLocaleDateString(dateStr: string) {
        return new Date(dateStr).toLocaleDateString();
    }
}

class TimelineComponent implements ng.IComponentOptions {
    public controller: ng.Injectable<ng.IControllerConstructor>;
    public controllerAs: string;
    public templateUrl: string = "access/components/timeline/component.html";
    public transclude: boolean = false;
    public bindings: any;

    constructor() {
      this.transclude = true;
      this.bindings = {
        steps: "<",
      };
      this.controller = TimelineController;
      this.controllerAs = "$ctrl";
    }
}

ngObibaMica.access.component("timeline", new TimelineComponent());
