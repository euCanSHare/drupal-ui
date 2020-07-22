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

interface ICacheService {
  getCache(key: string): any;
  clearCache(key: string): void;
}

class ApplicationCacheService implements ICacheService {
  private static $inject = ["$cacheFactory", "$log"];

  constructor(private $cacheFactory: any, private $log: any) {
  }

  public clearCache(key: string): void {
    const cache = this.$cacheFactory.get(key);
    if (cache) {
      cache.removeAll();
    }
  }

  public getCache(key: string): any {
    return this.$cacheFactory.get(key);
  }

}

ngObibaMica.utils.service("ApplicationCacheService", ApplicationCacheService);
