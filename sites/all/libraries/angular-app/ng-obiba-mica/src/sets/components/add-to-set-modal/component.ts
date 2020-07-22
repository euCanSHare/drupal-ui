"use strict";

interface IAddToSetModalComponentController extends ng.IComponentController {

  resolve: { query: string, type: string, ids?: any };

  close(result?: any): void;

  dismiss(reason?: any): void;
}

class AddToSetComponentModalController implements IAddToSetModalComponentController {

  public static EXISTING_CHOICE: string = "EXISTING";
  public static NEW_CHOICE: string = "NEW";

  private static $inject = [
    "RqlQueryService",
    "RqlQueryUtils",
    "SetsResource",
    "SetsImportResource",
    "SetService",
    "ngObibaMicaUrl",
    "AlertService"];

  public resolve: { query: string, type: string, excludeId?: string, ids?: any };
  public choice: { radio: string, selected?: any, name?: string };
  public canAccept: boolean;
  public sets: any[];
  public canAddMoreSets: boolean;
  public disableActions: boolean;

  public close: (result?: any) => void;
  public dismiss: (reason?: any) => void;

  constructor(
    private RqlQueryService: any,
    private RqlQueryUtils: any,
    private SetsResource: any,
    private SetsImportResource: any,
    private SetService: ISetService,
    private ngObibaMicaUrl: any,
    private AlertService: any) {
    this.disableActions = false;
  }

  public accept() {
    this.disableActions = true;
    if (this.choice.radio === "NEW") {
      this.choice.name = this.choice.name.trim();
    }

    if (this.choice.radio === "EXISTING" && this.choice.selected !== undefined) {
      this.processDocumentSet(
        this.choice.selected.id,
        this.resolve.type,
        this.resolve.query,
        this.resolve.ids).then((updatedSet) => {
        this.close(
          {
            $value: {
              id: updatedSet.id,
              name: updatedSet.name,
              newCount: updatedSet.count - this.choice.selected.count,
            },
          },
        );
      });
    } else {
      this.SetsImportResource.save({type: this.resolve.type, name: this.choice.name}, "")
        .$promise.then((set) => {
        this.processDocumentSet(
          set.id,
          this.resolve.type,
          this.resolve.query,
          this.resolve.ids).then((updatedSet) => {
          this.close(
            {
              $value: {
                id: updatedSet.id,
                name: updatedSet.name,
                newCount: updatedSet.count,
              },
            },
          );
        });
      });
    }
  }

  public cancel() {
    this.dismiss();
  }

  public onRadioChanged(): void {
    if (this.choice.radio === "NEW") {
      this.onNameChanged();
    } else if (this.choice.radio === "EXISTING") {
      this.onSelected();
    }
  }

  public onNameChanged(): void {
    this.choice.radio = "NEW";
    this.canAccept = this.choice.name && this.choice.name.trim().length > 0;
    if (this.choice.selected !== undefined) {
      this.choice.selected = undefined;
    }
  }

  public onSelected(): void {
    this.choice.radio = "EXISTING";
    this.canAccept = this.choice.selected !== undefined;
    if (this.choice.name !== undefined) {
      this.choice.name = undefined;
    }
  }

  public $onInit() {
    this.SetsResource.query({type: this.resolve.type}).$promise.then((allSets: any[]) => {
      this.sets = allSets.filter(
        (set: any) => set.name && (!this.resolve.excludeId || this.resolve.excludeId !== set.id),
      );
      const maxNumberOfSets = this.SetService.getMaxNumberOfSets();
      this.canAddMoreSets = this.sets.length < maxNumberOfSets - (this.resolve.excludeId ? 1 : 0);
      if (!this.canAddMoreSets) {
        this.AlertService.alert({
          delay: 0,
          id: "MaxAttainedAlert",
          msgArgs: [maxNumberOfSets, this.ngObibaMicaUrl.getUrl("SetsPage")],
          msgKey: "sets.maximum-number-attained",
          type: "warning",
        });
      }
    });
  }

  private addQuery(setId: string, type: string, query: string): any {
    const parsedQuery = this.RqlQueryService.parseQuery(query);
    const target = typeToTarget(type);

    const queryWithLimitAndFields =
      this.RqlQueryUtils
        .rewriteQueryWithLimitAndFields(parsedQuery, target, this.SetService.getMaxItemsPerSets(), ["id"]);
    return this.SetService.addDocumentQueryToSet(setId, type, queryWithLimitAndFields);
  }

  private processDocumentSet(
    setId: string,
    type: string,
    query?: string,
    identifiers?: any): any {
    const selections: string[] = Object.keys(identifiers);
    if (identifiers !== undefined && selections.length > 0) {
      return this.SetService.addDocumentToSet(setId, type, selections);
    } else {
      return this.addQuery(setId, type, query);
    }
  }
}

class AddToSetComponentModalComponent implements ng.IComponentOptions {
  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public templateUrl: string;
  public transclude: boolean;
  public bindings: any;

  constructor() {
    this.transclude = true;
    this.bindings = {
      close: "&",
      dismiss: "&",
      resolve: "<",
    };
    this.controller = AddToSetComponentModalController;
    this.controllerAs = "$ctrl";
    this.templateUrl = "sets/components/add-to-set-modal/component.html";
  }
}

angular.module("obiba.mica.sets").component("addToSetModal", new AddToSetComponentModalComponent());
