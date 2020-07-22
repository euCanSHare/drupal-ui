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

class PrintFriendlyController implements ng.IComponentController {
}

class PrintFriendlyComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string;
  public transclude: boolean;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      accessForm: "<",
      lastSubmittedDate: "<",
      model: "<",
      project: "<",
      validForm: "<",
    };
    this.controller = PrintFriendlyController;
    this.controllerAs = "$ctrl";
    this.templateUrl = "access/components/print-friendly-view/component.html";
  }
}

ngObibaMica.access.component("printFriendlyView", new PrintFriendlyComponent());
