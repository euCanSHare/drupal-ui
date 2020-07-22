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

class CrosstabStudyTableController implements ng.IComponentController {

    private static $inject = ["PageUrlService"];

    public contingency: any;
    public studyLink: any;

    constructor(private PageUrlService: any) {
        this.contingency = {};
    }

    public $onChanges() {
        if (this.contingency.studyTable) {
            this.studyLink = this.PageUrlService.studyPage(this.contingency.studyTable.studyId, "individual-study");
        }
    }

}

class CrosstabStudyTableComponent implements ng.IComponentOptions {
    public controller: ng.Injectable<ng.IControllerConstructor>;
    public controllerAs: string;
    public templateUrl: string;
    public transclude: boolean;
    public bindings: any;

    constructor() {
        this.transclude = true;
        this.bindings = {
            contingency: "<",
        };
        this.controller = CrosstabStudyTableController;
        this.controllerAs = "$ctrl";
        this.templateUrl = "analysis/components/crosstab-study-table/component.html";
    }
}

ngObibaMica.DatasetVariableCrosstab
    .component("crosstabStudyTable", new CrosstabStudyTableComponent());
