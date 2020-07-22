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

class BadgeCountController implements ng.IComponentController {
    private static $inject = ["$log"];
    public badgeOptions: any;
    public badgeClass: string;
    public entityCount: any;
    public entityType: string;
    public labelBadge: any;
    public query: string;

    constructor(private $log: any) {
    }

}

class BadgeCountComponent implements ng.IComponentOptions {

    public controller: ng.Injectable<ng.IControllerConstructor>;
    public controllerAs: string;
    public templateUrl: string;
    public transclude: boolean;
    public bindings: any;

    constructor() {
        this.transclude = true;
        this.bindings = {
            badgeClass: "<",
            badgeOptions: "<",
            entityCount: "<",
            entityType: "<",
            labelBadge: "<",
            query: "<",
        };
        this.controller = BadgeCountController;
        this.controllerAs = "$ctrl";
        this.templateUrl = "lists/components/badge-count/component.html";
    }
}

ngObibaMica.search
    .component("badgeCount", new BadgeCountComponent());
