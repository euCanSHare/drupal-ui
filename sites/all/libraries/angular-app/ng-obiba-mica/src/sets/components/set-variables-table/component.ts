"use strict";

declare var QUERY_TYPES: any;

class VariablesSetTableComponentController extends DocumentsSetTableComponentController {

  private static $inject = ["SetService", "AnalysisConfigService", "$log", "$translate", "PageUrlService",
    "LocalizedValues", "$uibModal"];

  constructor(
    protected SetService: ISetService,
    protected AnalysisConfigService: any,
    protected $log: any,
    private $translate: any,
    private PageUrlService: any,
    private LocalizedValues: any,
    protected $uibModal: any) {
    super(SetService, AnalysisConfigService, $log, $uibModal);
    SetService.serverConfig().then((config) => {
      this.micaConfigShowAnalysis = config.isSetsAnalysisEnabled;
      this.micaConfigShowSearch = config.isSetsSearchEnabled;
      this.micaConfigShowOpalViews = config.downloadOpalViewsFromSetsAllowed;
    });
  }

  public $onChanges(changes: any) {
    if (changes.setId !== undefined) {
      this.allSelected = false;
      this.allPageSelected = {};
      this.selections = {};
    }

    this.table = this.asTable();
    this.localizedTotal = this.LocalizedValues
      .formatNumber((this.documents && this.documents.total) ? this.documents.total : 0);
  }

  private localize(values): string {
    return this.LocalizedValues.forLang(values, this.$translate.use());
  }

  private asTable(): any {
    const table = {
      rows: new Array(),
    };
    this.pagination.totalHits = this.documents ? this.documents.total : 0;
    this.pagination.currentPage = this.documents ? this.documents.from / this.documents.limit + 1 : 0;
    this.pagination.itemsPerPage = this.documents ? this.documents.limit : 0;
    this.pagination.pageCount = Math.ceil (this.pagination.totalHits / this.pagination.itemsPerPage);
    this.pagination.from = this.documents ? this.documents.from + 1 : 0;
    const documentCounts = this.documents && this.documents[this.type] ? this.documents[this.type].length : 0;
    this.pagination.to = this.documents ? this.documents.from + documentCounts : 0;
    if (documentCounts) {
      if (this.allSelected) {
        this.allPageSelected[this.pagination.currentPage] = true;
      }
      this.documents[this.type].forEach((doc) => {
        if (this.allSelected) {
          this.selections[doc.id] = true;
        }
        const studyAcronym = this.localize(doc.studySummary.acronym);
        const studyName = this.localize(doc.studySummary.name);
        const studyType = doc.variableType === "Dataschema" ? "harmonization" : "individual";
        const studyLink = this.PageUrlService.studyPage(doc.studyId, studyType);
        const datasetName = this.localize(doc.datasetName);
        const datasetLink = this.PageUrlService.datasetPage(doc.datasetId, doc.variableType);
        const variableLink = this.PageUrlService.variablePage(doc.id);
        const attrLabel = (doc.attributes || []).filter((attr) => attr.name === "label");
        const variableLabel = attrLabel && attrLabel.length > 0 ? this.localize(attrLabel[0].values) : "";
        const row = new Array(
          {
            link: undefined,
            value: doc.id,
          },
          {
            link: variableLink ? variableLink : datasetLink,
            value: doc.name,
          },
          {
            link: undefined,
            value: variableLabel,
          },
          {
            link: undefined,
            value: doc.variableType,
          },
          {
            link: studyLink,
            value: studyAcronym,
          },
          {
            link: datasetLink,
            value: datasetName,
          },
        );
        table.rows.push(row);
      });
    }
    return table;
  }
}

class DocumentSetTableComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string;
  public transclude: boolean;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      documents: "<",
      onPageChange: "<",
      onUpdate: "<",
      options: "<",
      setId: "<",
      type: "<",
    };
    this.controller = VariablesSetTableComponentController;
    this.controllerAs = "$ctrl";
    this.templateUrl = "sets/components/set-variables-table/component.html";
  }
}

angular.module("obiba.mica.sets").component("setVariablesTable", new DocumentSetTableComponent());
