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

interface IEntitiesCountService {
  isSingleStudy(): boolean;
  update(originalQuery: string, newQuery: string): void;
}

class EntitiesCountService implements IEntitiesCountService {

  private static $inject = ["$location", "ObibaServerConfigResource"];

  private hasMultipleStudies: boolean;

  constructor(
    private $location: any,
    private ObibaServerConfigResource: any) {
      const that = this;
      ObibaServerConfigResource.get((micaConfig) => {
        that.hasMultipleStudies = !micaConfig.isSingleStudyEnabled || micaConfig.isHarmonizedDatasetEnabled;
      });
    }

  public isSingleStudy(): boolean {
    return !this.hasMultipleStudies;
  }

  /**
   * Replace the original query with the new one in the browser location. If new query is empty,
   * the criteria is to be removed.
   * @param originalQuery Query before update
   * @param newQuery Query after update
   */
  public update(originalQuery: string, newQuery: string): void {
    if (originalQuery === newQuery) {
      return;
    }
    const search = this.$location.search();
    search.query = search.query.split(originalQuery).join("").replace(/,,/, ",").replace(/^,/, "").replace(/,$/, "");
    if (newQuery && newQuery.length !== 0) {
      if (search.query && search.query.length > 0) {
        search.query = search.query + "," + newQuery;
      } else {
        search.query = newQuery;
      }
    }
    this.$location.search(search);
  }
}

ngObibaMica.analysis.service("EntitiesCountService", ["$location", "ObibaServerConfigResource", EntitiesCountService]);
