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

interface IDataAccessEntityUrls {
  getDataAccessRequestsUrl(): string;

  getDataAccessRequestBaseUrl(): string;

  getDataAccessRequestUrl(id: string): string;

  getDataAccessAmendmentsUrl(parentId: string): string;

  getDataAccessAmendmentBaseUrl(parentId: string): string;

  getDataAccessAmendmentUrl(parentId: string, id: string);
}

class DataAccessEntityUrls implements IDataAccessEntityUrls {
  public getDataAccessRequestsUrl(): string {
    return "/data-access-requests";
  }

  public getDataAccessRequestBaseUrl(): string {
    return "/data-access-request";
  }

  public getDataAccessRequestUrl(id: string): string {
    return this.getDataAccessRequestBaseUrl() + "/" + id;
  }

  public getDataAccessAmendmentsUrl(parentId: string): string {
    return "/data-access-request/" + parentId + "/amendments";
  }

  public getDataAccessAmendmentBaseUrl(parentId: string): string {
    return "/data-access-request/" + parentId + "/amendment";
  }

  public getDataAccessAmendmentUrl(parentId: string, id: string) {
    return this.getDataAccessAmendmentBaseUrl(parentId) + "/" + id;
  }

}

ngObibaMica.access.service("DataAccessEntityUrls", DataAccessEntityUrls);
