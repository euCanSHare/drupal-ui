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

class EntitiesCountResultTableController implements ng.IComponentController {

  private static $inject = ["PageUrlService", "LocalizedValues", "EntitiesCountService", "$translate", "$log"];

  public result: any;
  public studyCount: number;
  public table: any;
  public localizedTotal: string;

  constructor(
    private PageUrlService: any,
    private LocalizedValues: any,
    private EntitiesCountService: any,
    private $translate: any,
    private $log: any) {
      this.result = {};
  }

  public $onInit() {
    this.table = {
      rows: new Array(),
    };
  }

  public $onChanges() {
    this.table = this.asTable();
    this.localizedTotal = this.LocalizedValues.formatNumber(this.result.total ? this.result.total : 0);
    if (this.result.belowPrivacyThreshold) {
      this.localizedTotal = "<" + this.localizedTotal;
    }
  }

  public showStudyColumn(): boolean {
    return !this.EntitiesCountService.isSingleStudy();
  }

  private localize(values): string {
    return this.LocalizedValues.forLang(values, this.$translate.use());
  }

  private asTable(): any {
    const table = {
      rows: new Array(),
    };
    this.studyCount = this.result.counts ? this.result.counts.length : 0;
    if (this.studyCount) {
      this.result.counts.forEach((studyResult) => {
        const studyAcronym = this.localize(studyResult.study.acronym);
        const studyName = this.localize(studyResult.study.name);
        if (studyResult.counts) {
          let studyRowCount = 0;
          studyResult.counts.forEach((datasetResult) => {
            const datasetAcronym = this.localize(datasetResult.dataset.acronym);
            const datasetName = this.localize(datasetResult.dataset.name);
            if (datasetResult.counts) {
              datasetResult.counts.forEach((variableResult) => {
                const parts = variableResult.variable.id.split(":");
                let variableName = parts[1];
                if (variableResult.studyTableName) {
                  variableName = variableName + " (" + this.localize(variableResult.studyTableName) + ")";
                }
                const variableType = parts[2];
                const variableLink = this.PageUrlService.variablePage(variableResult.variable.id);
                const datasetLink = this.PageUrlService.datasetPage(datasetResult.dataset.id, variableType);
                const studyType = variableType === "Dataschema" ? "harmonization" : "individual";
                const row = new Array(
                  {
                    colspan: 1,
                    link: this.PageUrlService.studyPage(studyResult.study.id, studyType),
                    rowspan: studyRowCount === 0 ? 1 : 0,
                    title: studyRowCount === 0 ? studyName : "",
                    value: studyRowCount === 0 ? studyAcronym : "",
                  },
                  {
                    colspan: 1,
                    link: variableLink ? variableLink : datasetLink,
                    rowspan: 1,
                    title: this.localize(variableResult.variable.name),
                    value: variableName,
                  },
                  {
                    colspan: 1,
                    link: datasetLink,
                    rowspan: 1,
                    title: datasetName,
                    value: datasetAcronym,
                  },
                  {
                    colspan: 1,
                    link: undefined,
                    rowspan: 1,
                    title: variableResult.query,
                    value: variableResult.query,
                  },
                  {
                    colspan: 1,
                    link: undefined,
                    rowspan: 1,
                    title: undefined,
                    value: this.LocalizedValues.formatNumber(variableResult.count),
                  });
                table.rows.push(row);
                studyRowCount++;
              });
            }
          });
          table.rows[table.rows.length - studyRowCount][0].rowspan = studyRowCount + 1;
          table.rows.push(new Array(
            {
              colspan: 1,
              rowspan: 0,
              title: undefined,
              value: undefined,
            },
            {
              colspan: 3,
              rowspan: 1,
              title: studyResult.query,
              value: undefined,
            },
            {
              colspan: 1,
              rowspan: 1,
              title: undefined,
              value: (studyResult.belowPrivacyThreshold ? "<" : "")
                + this.LocalizedValues.formatNumber(studyResult.total),
            }));
        }
      });
    }
    return table;
  }
}

class EntitiesCountResultTableComponent implements ng.IComponentOptions {

  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string;
  public transclude: boolean;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      result: "<",
    };
    this.controller = EntitiesCountResultTableController;
    this.controllerAs = "$ctrl";
    this.templateUrl = "analysis/components/entities-count-result-table/component.html";
  }
}

ngObibaMica.analysis
  .component("entitiesCountResultTable", new EntitiesCountResultTableComponent());
