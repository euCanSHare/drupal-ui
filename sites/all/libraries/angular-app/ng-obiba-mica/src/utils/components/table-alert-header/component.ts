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

class TableAlarmHeaderController implements ng.IComponentController {
  private static $inject = ["$log"];
  public onSelectAll: (args: any) => void;

  constructor(private $log: any) {
  }

  public selectAll(): void {
    this.onSelectAll({});
  }
}

class TableAlarmHeaderComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string = "utils/components/table-alert-header/component.html";
  public transclude: boolean = false;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      allSelected: "<",
      onSelectAll: "&",
    };
    this.controller = TableAlarmHeaderController;
    this.controllerAs = "$ctrl";
  }
}

ngObibaMica.utils.component("tableAlertHeader", new TableAlarmHeaderComponent());
