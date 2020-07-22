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

interface IDataAccessEntityResourceFactory {
  list(listUrl: string): any;

  create(listUrl: string, data: any, successCallback: any, errorCallback: any): any;

  get(entityRootPath: string, id: string): any;

  update(entityRootPath: string, data: any): any;

  delete(entityRootPath: string, id: string): any;
}

class DataAccessEntityResource implements IDataAccessEntityResourceFactory {

  private static $inject = [
    "DataAccessRequestsResource",
    "DataAccessRequestResource",
    "DataAccessAmendmentsResource",
    "DataAccessAmendmentResource",
    "DataAccessRequestStatusResource",
    "DataAccessAmendmentStatusResource",
  ];

  constructor(
    private DataAccessRequestsResource: any,
    private DataAccessRequestResource: any,
    private DataAccessAmendmentsResource: any,
    private DataAccessAmendmentResource: any,
    private DataAccessRequestStatusResource: any,
    private DataAccessAmendmentStatusResource: any,
  ) { }

  public list(listUrl: string): any {
    const parentId: string = this.getParentId(listUrl);
    return parentId ?
      this.DataAccessAmendmentsResource.query({ parentId }) :
      this.DataAccessRequestsResource.query();
  }

  public create(listUrl: string, data: any, successCallback: any, errorCallback: any): any {
    const parentId: string = this.getParentId(listUrl);
    return parentId ?
      this.DataAccessAmendmentsResource.save(data, successCallback, errorCallback) :
      this.DataAccessRequestsResource.save(data, successCallback, errorCallback);
  }

  public update(entityRootPath: string, data: any): any {
    const parentId: string = this.getParentId(entityRootPath);
    return parentId ?
      this.DataAccessAmendmentResource.save(data) :
      this.DataAccessRequestResource.save(data);
  }

  public get(entityRootPath: string, id: string): any {
    const parentId: string = this.getParentId(entityRootPath);
    return parentId ?
      this.DataAccessAmendmentResource.get({ parentId, id }) :
      this.DataAccessRequestResource.get({ id });
  }

  public delete(entityRootPath: string, id: string): any {
    const parentId: string = this.getParentId(entityRootPath);
    return parentId ?
      this.DataAccessAmendmentResource.delete({ parentId, id }) :
      this.DataAccessRequestResource.delete({ id });
  }

  public updateStatus(entityRootPath: string, id: string, status: string): any {
    const parentId: string = this.getParentId(entityRootPath);
    return parentId ?
      this.DataAccessAmendmentStatusResource.update({ parentId, id, status }) :
      this.DataAccessRequestStatusResource.update({ id, status });
  }

  private getParentId(url: string) {
    const parentId = /data-access-request\/([a-zA-Z0-9_-]+)(?:\/amendment)?/.exec(url);
    return parentId && parentId.length === 2 ? parentId[parentId.index] : null;
  }
}

ngObibaMica.access.service("DataAccessEntityResource", DataAccessEntityResource);
