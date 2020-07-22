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

declare var ngObibaMica: any;

interface IAnalysisConfigService {
  setOptions(newOptions: any): void;
  getOptions(): any;
  showAnalysis(): boolean;
}

class AnalysisConfigService implements IAnalysisConfigService {

  private options: any;

  constructor() {
    this.options = {
        crosstab: {
            showDetailedStats: true,
        },
      showAnalysis: true,
    };
  }

  public setOptions(newOptions: any): void {
    if (typeof(newOptions) === "object") {
      Object.keys(newOptions).forEach((option) => {
        if (option in this.options) {
          this.options[option] = newOptions[option];
        }
      });
    }
  }

  public getOptions(): any {
    return angular.copy(this.options);
  }

  public showAnalysis(): boolean {
    return this.options.showAnalysis;
  }
}

ngObibaMica.analysis.service("AnalysisConfigService", [AnalysisConfigService]);
