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

class SetsAlertBuilder {

  public static newBuilder(AlertService: any): SetsAlertBuilder {
    return new SetsAlertBuilder(AlertService);
  }

  private id: string;
  private count: number;
  private emptyMsgKey: string;
  private msgKey: string;
  private name: string;
  private redirectUrl: string;

  constructor(private AlertService: any) {
  }

  public withId(value: string): SetsAlertBuilder {
    this.id = value;
    return this;
  }

  public withName(value: string) {
    this.name = value;
    return this;
  }

  public withCount(value: number) {
    this.count = value;
    return this;
  }

  public withMsgKey(value: string) {
    this.msgKey = value;
    return this;
  }

  public withEmptyMsgKey(value: string) {
    this.emptyMsgKey = value;
    return this;
  }

  public withRedirectUrl(value: string) {
    this.redirectUrl = value;
    return this;
  }

  public showAlert() {
    let msgKey = this.msgKey;
    let msgArgs: string[] = [this.redirectUrl];

    if (this.id) {
      msgArgs.push(this.id);
    }

    msgArgs.push(this.count + "");

    if (this.name) {
      msgArgs.push(this.name);
    }

    if (this.count === 0) {
      msgKey = this.emptyMsgKey;
      msgArgs = [];
    }

    this.AlertService.growl({
      delay: 4000,
      id: "MainControllerGrowl",
      msgArgs,
      msgKey,
      type: "info",
    });
  }
}
