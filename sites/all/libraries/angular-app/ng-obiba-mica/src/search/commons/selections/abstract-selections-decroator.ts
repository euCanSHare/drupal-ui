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

declare var QUERY_TARGETS: any;
declare var QUERY_TYPES: any;

abstract class AbstractSelectionsDecorator implements ISelections {

  protected component: any;
  protected documentType: string;

  constructor(documentType: string) {
    this.documentType = documentType;
  }

  public getSelections(): any {
    return this.component.selections;
  }

  public getSelectionIds(): any {
    return this.component.selections ? Object.keys(this.component.selections) : [];
  }

  public clearSelections() {
    this.component.selections = {};
    this.component.page = {selections: {}, all: false};
  }

  public abstract select(id: string);

  public abstract selectPage();

  public abstract selectAll();

  public decorate(component: any): void {
    this.component = component;
    this.component.selections = {};
    this.component.page = {selections: {}, all: false};

  }
}
