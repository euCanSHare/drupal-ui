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

class CellStatValueController implements ng.IComponentController {
    private static $inject = ["$log"];
    public destinationTab: any;
    public disable: boolean;
    public entityCount: any;
    public resultTabOrder: any;
    public updateCriteria: () => void;

    constructor(private $log: any) {
    }

    public clickCriteria(): void {
        this.updateCriteria();
    }

    public $onInit() {
        if (this.resultTabOrder.indexOf(this.destinationTab) < 0) {
            this.disable = true;
        }
    }

}

class CellStatValueComponent implements ng.IComponentOptions {

    public controller: ng.Injectable<ng.IControllerConstructor>;
    public controllerAs: string;
    public templateUrl: string;
    public transclude: boolean;
    public bindings: any;

    constructor() {
        this.transclude = true;
        this.bindings = {
            destinationTab: "@",
            entityCount: "<",
            resultTabOrder: "<",
            updateCriteria: "&",
        };
        this.controller = CellStatValueController;
        this.controllerAs = "$ctrl";
        this.templateUrl = "search/components/result/cell-stat-value/component.html";
    }
}

ngObibaMica.search
    .component("cellStatValue", new CellStatValueComponent());
