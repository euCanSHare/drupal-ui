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

interface ISetService {

  serverConfig(): any;
  isSingleStudy(): boolean;
  hasHarmonizedDatasets(): boolean;
  getMaxItemsPerSets(): number;
  getMaxNumberOfSets(): number;

  isDocumentInSet(setId: string, documentType: string, documentId: string): any;
  isDocumentInCart(documentType: string, documentId: string): any;
  addDocumentToSet(setId: string, documentType: string, documentId: string | string[]): any;
  addDocumentToCart(documentType: string, documentId: string | string[]): any;
  addDocumentQueryToSet(setId: string, documentType: string, rqlQuery: string): any;
  addDocumentQueryToCart(documentType: string, query: string): any;
  removeDocumentFromSet(setId: string, documentType: string, documentId: string | string[]): any;
  removeDocumentFromCart(documentType: string, documentId: string | string[]): any;
  getSetDocuments(setId: string, documentType: string, fromIdx: number, limitIdx: number): any;
  getCartDocuments(documentType: string, fromIdx: number, limitIdx: number): any;
  clearSet(setId: string, documentType: string): any;
  clearCart(documentType: string): any;
  gotoSetEntitiesCount(setId: string, documentId: string | string[]): void;
  getDownloadUrl(documentType: string, setId: string): string;
  getDownloadUrlForIds(documentType: string, setId: string, ids: string[]): string;
  gotoEntitiesCount(ids: string[]): void;
  getSearchQuery(documentType: string, setId: string): string;
  gotoSearch(documentType: string, setId: string): void;
  getCartSet(documentType: string): any;
  setSettingOption(newOptions: any): void;
  setGettingOption(): any;

  getOpalViewsDownloadUrl(type: string, setId: string, ids: string[]): string;
}

class SetService implements ISetService {

  private static $inject = [
    "$window",
    "$location",
    "$log",
    "$translate",
    "localStorageService",
    "PageUrlService",
    "SetsImportResource",
    "SetResource",
    "SetDocumentsResource",
    "SetClearResource",
    "SetExistsResource",
    "SetImportResource",
    "SetImportQueryResource",
    "SetRemoveResource",
    "ObibaServerConfigResource",
    "SessionProxy"];

  private hasMultipleStudies: boolean;
  private hasHarmonization: boolean;

  private maxNumberOfSets: number;
  private maxItemsPerSets: number;
  private options: any;

  constructor(
    private $window: any,
    private $location: any,
    private $log: any,
    private $translate: any,
    private localStorageService: any,
    private PageUrlService: any,
    private SetsImportResource: any,
    private SetResource: any,
    private SetDocumentsResource: any,
    private SetClearResource: any,
    private SetExistsResource: any,
    private SetImportResource: any,
    private SetImportQueryResource: any,
    private SetRemoveResource: any,
    private ObibaServerConfigResource: any,
    private SessionProxy: any) {
    this.options = {
      CartHelpText: null,
      SetsHelpText: null,
    };
  }

  public setSettingOption(newOptions: any): void {
    if (typeof(newOptions) === "object") {
      Object.keys(newOptions).forEach((option) => {
        if (option in this.options) {
          this.options[option] = newOptions[option];
        }
      });
    }
  }

  public setGettingOption(): any {
    return angular.copy(this.options);
  }

  public serverConfig(): any {
    const serverConfigPromise = this.ObibaServerConfigResource.get((micaConfig) => {
      this.hasMultipleStudies = !micaConfig.isSingleStudyEnabled || micaConfig.isHarmonizedDatasetEnabled;
      this.hasHarmonization = micaConfig.isHarmonizedDatasetEnabled;

      this.maxNumberOfSets = micaConfig.maxNumberOfSets;
      this.maxItemsPerSets = micaConfig.maxItemsPerSet;

      return micaConfig;
    });
    return serverConfigPromise.$promise || serverConfigPromise;
  }

  public isSingleStudy(): boolean {
    return !this.hasMultipleStudies;
  }

  public hasHarmonizedDatasets(): boolean {
    return this.hasHarmonization;
  }

  public getMaxItemsPerSets(): number {
    return this.maxItemsPerSets;
  }

  public getMaxNumberOfSets(): number {
    return this.maxNumberOfSets;
  }

  /**
   * Get the documents in the set.
   * Return a promise on the documents.
   * @param setId the set's identifier
   * @param documentType the document type
   * @param fromIdx from position
   * @param limitIdx maximum number of documents that are fetched
   */
  public getSetDocuments(setId: string, documentType: string, fromIdx: number, limitIdx: number): any {
    return this.SetDocumentsResource.get({
      from: fromIdx,
      id: setId,
      limit: limitIdx,
      type: documentType,
    }).$promise;
  }

  /**
   * Get the documents in the cart. Create the cart's set if missing.
   * Return a promise on the documents.
   * @param documentType the document type
   * @param fromIdx from position
   * @param limitIdx maximum number of documents that are fetched
   */
  public getCartDocuments(documentType: string, fromIdx: number, limitIdx: number): any {
    return this.getOrCreateCart(documentType).then((set) => {
      return this.getSetDocuments(set.id, documentType, fromIdx, limitIdx);
    });
  }

  /**
   * Check if document is in the set.
   * Return a promise on the response.
   * @param setId the set's identifier
   * @param documentType the document type
   * @param documentId the document ID
   */
  public isDocumentInSet(setId: string, documentType: string, documentId: string): any {
    return this.SetExistsResource.get({ type: documentType, id: setId, did: documentId }).$promise;
  }

  /**
   * Check if document is in the cart.
   * Return a promise on the response.
   * @param documentType the document type
   * @param documentId the document ID
   */
  public isDocumentInCart(documentType: string, documentId: string): any {
    return this.getOrCreateCart(documentType).then((set) => {
      return this.isDocumentInSet(set.id, documentType, documentId);
    });
  }

  /**
   * Add one or more documents to the set.
   * Return a promise on the set.
   * @param setId the set's identifier
   * @param documentType the document type
   * @param documentId the document ID or an array od document IDs
   */
  public addDocumentToSet(setId: string, documentType: string, documentId: string | string[]): any {
    const did = Array.isArray(documentId) ? documentId.join("\n") : documentId;
    return this.SetResource.get({ type: documentType, id: setId }).$promise.then((set) => {
      return this.SetImportResource.save({ type: documentType, id: set.id }, did).$promise;
    }).then((set) => {
      this.notifySetChanged(set);
      return set;
    });
  }

  /**
   * Add one or more documents to the cart's set.
   * Return a promise on the cart's set.
   * @param documentType the document type
   * @param documentId the document ID or an array of document IDs
   */
  public addDocumentToCart(documentType: string, documentId: string | string[]): any {
    const did = Array.isArray(documentId) ? documentId.join("\n") : documentId;
    return this.getOrCreateCart(documentType).then((set) => {
      return this.SetImportResource.save({ type: documentType, id: set.id }, did).$promise;
    }).then((set) => {
      return this.saveCart(documentType, set);
    });
  }

  /**
   * Add documents matching the query to the set.
   * Return a promise on the set.
   * @param setId the set's identifier
   * @param documentType the document type
   * @param rqlQuery the documents join query
   */
  public addDocumentQueryToSet(setId: string, documentType: string, rqlQuery: string): any {
    this.$log.info("query=" + rqlQuery);
    return this.SetImportQueryResource.save({ type: documentType, id: setId, query: rqlQuery }).$promise
      .then((set) => {
        this.notifySetChanged(set);
        return set;
      });
  }

  /**
   * Add documents matching the query to the cart's set.
   * Return a promise on the cart's set.
   * @param documentType the document type
   * @param rqlQuery the documents join query
   */
  public addDocumentQueryToCart(documentType: string, rqlQuery: string): any {
    this.$log.info("query=" + rqlQuery);
    return this.getOrCreateCart(documentType).then((set) => {
      return this.SetImportQueryResource.save({ type: documentType, id: set.id, query: rqlQuery }).$promise;
    }).then((set) => {
      return this.saveCart(documentType, set);
    });
  }

  /**
   * Remove one or more documents from the set.
   * Return a promise on the set.
   * @param setId the set's identifier
   * @param documentType the document type
   * @param documentId the document ID or an array of document IDs
   */
  public removeDocumentFromSet(setId: string, documentType: string, documentId: string | string[]): any {
    const did = Array.isArray(documentId) ? documentId.join("\n") : documentId;
    return this.SetRemoveResource.delete({ type: documentType, id: setId }, did).$promise.then((set) => {
      this.notifySetChanged(set);
      return set;
    });
  }

  /**
   * Remove one or more documents from the cart's set.
   * Return a promise on the cart's set.
   * @param documentType the document type
   * @param documentId the document ID or an array of document IDs
   */
  public removeDocumentFromCart(documentType: string, documentId: string | string[]): any {
    const did = Array.isArray(documentId) ? documentId.join("\n") : documentId;
    return this.getOrCreateCart(documentType).then((set) => {
      return this.SetRemoveResource.delete({ type: documentType, id: set.id }, did).$promise;
    }).then((set) => {
      return this.saveCart(documentType, set);
    });
  }

  /**
   * Clear the documents list of the set.
   * @param setId the set's identifier
   * @param documentType the document type
   */
  public clearSet(setId: string, documentType: string): any {
    return this.SetClearResource.clear({ type: documentType, id: setId }).$promise.then(() => {
      return this.SetResource.get({ id: setId, type: documentType }).$promise;
    }).then((set) => {
      this.notifySetChanged(set);
      return set;
    });
  }

  /**
   * Clear the documents list of the cart.
   * @param documentType the document type
   */
  public clearCart(documentType: string): any {
    return this.getOrCreateCart(documentType).then((set) => {
      return this.SetClearResource.clear({ type: documentType, id: set.id }).$promise;
    }).then(() => {
      this.notifyCartChanged(documentType);
      return this.getOrCreateCart(documentType);
    });
  }

  /**
   * Go to the entities count page for the variables belonging to the provided set.
   * Note that the number of variables for this type of analysis is limited to 20.
   * @param setId the set ID, if undefined, the cart set ID is used
   * @param documentId one or more document id (optional)
   */
  public gotoSetEntitiesCount(setId: string, documentId: string | string[]): void {
    const max = 20;
    let sid = setId;
    if (!sid) {
      const cartSet = this.getCartSet("variables");
      if (cartSet) {
        sid = cartSet.id;
      }
    }
    // TODO make a search query instead to force variable type to Collected
    if (!documentId) {
      this.SetDocumentsResource.get({ type: "variables", id: sid, from: 0, limit: max }).$promise
        .then((documents) => {
          this.gotoEntitiesCount(documents.variables.map((doc) => doc.id));
        });
    } else {
      const ids = Array.isArray(documentId) ? documentId : [documentId];
      this.gotoEntitiesCount(ids.slice(0, max));
    }
  }

  /**
   * Go to the entities count page with the provided identifiers.
   * @param ids the selected identifiers
   */
  public gotoEntitiesCount(ids: string[]): void {
    if (ids) {
      const queryStr = ids.map((id) => {
        return "all(" + id + ")";
      }).join(",");
      this.$window.location.href = this.PageUrlService.entitiesCountPage(queryStr);
      this.$location.replace();
    }
  }

  public getOpalViewsDownloadUrl(type: string, setId: string, ids: string[]) {
    if (!setId) {
      const cartSet = this.getCartSet("variables");
      if (cartSet) {
        setId = cartSet.id;
      }
    }

    return this.PageUrlService.downloadOpalView(type, setId, ids);
  }

  public getDownloadUrl(documentType: string, setId: string): string {
    let id = setId;
    if (!id) {
      const cartSet = this.getCartSet(documentType);
      if (cartSet) {
        id = cartSet.id;
      }
    }
    if (id) {
      const queryStr = "variable(in(Mica_variable.sets," + id + "),limit(0," + this.maxItemsPerSets + ")"
        + ",fields((attributes.label.*,variableType,datasetId,datasetAcronym))"
        + ",sort(variableType,containerId,populationWeight,dataCollectionEventWeight,datasetId,index,name))"
        + ",locale(" + this.$translate.use() + ")";
      return this.PageUrlService.downloadList(documentType, queryStr);
    }
    return null;
  }

  public getDownloadUrlForIds(documentType: string, setId: string, ids: string[]): string {
    if (!ids || ids.length < 1) {
      return this.getDownloadUrl(documentType, setId);
    }

    const queryStr = "variable(in(id,(" + ids.join(",") + ")),limit(0," + this.maxItemsPerSets + ")"
      + ",fields((attributes.label.*,variableType,datasetId,datasetAcronym))"
      + ",sort(variableType,containerId,populationWeight,dataCollectionEventWeight,datasetId,index,name))"
      + ",locale(" + this.$translate.use() + ")";
    return this.PageUrlService.downloadList(documentType, queryStr);
  }

  public getSearchQuery(documentType: string, setId: string): string {
    const target = typeToTarget(documentType);
    return  setId
      ? target + "(in(Mica_" + target + ".sets," + setId + "))"
      : target + "(in(Mica_" + target + ".sets," + this.getCartSet(documentType).id + "))";
  }

  /**
   * Go to search page with documents filtered by the set they belong to.
   * @param documentType the document type
   * @param setId the set ID, if undefined, the cart set ID is used
   */
  public gotoSearch(documentType: string, setId: string): void {
    let id = setId;
    if (!id) {
      const cartSet = this.getCartSet(documentType);
      if (cartSet) {
        id = cartSet.id;
      }
    }
    if (id) {
      const queryStr = this.getSearchQuery(documentType, id);
      this.$window.location.href = this.PageUrlService.searchPage(queryStr);
      this.$location.replace();
    }
  }

  /**
   * Get the cart set if it exists.
   * @param documentType the document type
   */
  public getCartSet(documentType: string): any {
    const storage = this.localStorageService.get(this.getCartKey(documentType)) || {};
    const username = this.SessionProxy.profile() ? this.SessionProxy.login() : "anonymous";
    return storage[username];
  }

  /**
   * Always get the cart set in case of the set was deleted from the server. If unknown or not found, create it.
   * Return a promise on the cart's set.
   * @param documentType the document type
   */
  private getOrCreateCart(documentType: string): any {
    const cartSet = this.getCartSet(documentType);
    if (cartSet) {
      return this.SetResource.get({ type: documentType, id: cartSet.id }).$promise
        .then((set) => {
          return this.saveCart(documentType, set);
        })
        .catch(() => {
          return this.createCart(documentType, "");
        });
    } else {
      return this.createCart(documentType, "");
    }
  }

  /**
   * Create a cart and returns a promise on the created set.
   * @param documentType the document type
   * @param documentId the document ID to be added to the cart (can be empty)
   */
  private createCart(documentType: string, documentId: string): any {
    return this.SetsImportResource.save({ type: documentType }, documentId).$promise
      .then((set) => {
        return this.saveCart(documentType, set);
      });
  }

  private saveCart(documentType: string, set: any) {
    if (set && set.id) { // sanity check
      const storage = this.localStorageService.get(this.getCartKey(documentType)) || {};
      storage[set.username] = set;
      this.localStorageService.set(this.getCartKey(documentType), storage);
      this.notifyCartChanged(documentType);
      return set;
    }
    return undefined;
  }

  /**
   * Get the local storage key for the cart.
   * @param documentType the document type
   */
  private getCartKey(documentType: string): string {
    return "cart." + documentType;
  }

  /**
   * Notify at document level.
   * @param eventType the type of the event
   * @param documentType the document type
   */
  private notify(eventType: string, detail: string): void {
    let event;
    try {
      // For modern browsers except IE:
      event = new CustomEvent(eventType, { detail });
    } catch (err) {
      // If IE 11 (or 10 or 9...?) do it this way:
      // Create the event.
      event = document.createEvent("Event");
      // Define that the event name is 'build'.
      event.initEvent(eventType, true, true);
      event.detail = detail;
    }
    // Dispatch/Trigger/Fire the event
    document.dispatchEvent(event);
  }

  /**
   * Notify at document level that the set was updated.
   * @param documentType the document type
   */
  private notifySetChanged(documentType: string): void {
    this.notify("set-updated", documentType);
  }

  /**
   * Notify at document level that the cart set was updated.
   * @param documentType the document type
   */
  private notifyCartChanged(documentType: string): void {
    this.notify("cart-updated", documentType);
  }
}

ngObibaMica.sets.service("SetService", SetService);
