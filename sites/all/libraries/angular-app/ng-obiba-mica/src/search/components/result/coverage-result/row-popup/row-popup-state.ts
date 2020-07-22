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

class RowPopupState {
  private element: HTMLElement;
  private model: any;

  public update(target, model): void {
    this.element = "TR"  === target.tagName ? target : target.closest("TR");
    this.model = model;
  }

  public reset(): void {
    this.element = null;
    this.model = null;
  }

  public getElement(): any {
    return this.element;
  }

  public getModel(): any {
    return this.model;
  }

}
