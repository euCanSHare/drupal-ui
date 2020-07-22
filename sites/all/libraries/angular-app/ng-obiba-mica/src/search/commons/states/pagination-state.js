/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *  
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *  
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

(function () {
  var pageSizes = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  ngObibaMica.search.PaginationState = function(target, defaultPageSize) {
    this.target = target;
    this.initialPageSize = defaultPageSize;
    this.currentPage = 1;
    this.from = 0;
    this.to = 0;
    this.selected = this.findPageSize(defaultPageSize);
    this.totalHits = null;
    this.pageCount = 0;
    this.maxSize = 3;
  };

  ngObibaMica.search.PaginationState.prototype.updateRange = function() {
    var pageSize = this.selected.value;
    var current = this.currentPage;
    this.from = pageSize * (current - 1) + 1;
    this.to = Math.min(this.totalHits, pageSize * current);
  };

  ngObibaMica.search.PaginationState.prototype.initializeCurrentPage = function(pagination) {

    if (pagination && pagination.hasOwnProperty('from')) {
      this.selected = this.findPageSize(pagination.size);
      this.currentPage = 1 + pagination.from / this.selected.value;
    } else {
      this.selected = this.findPageSize(this.initialPageSize);
      this.currentPage = 1;
    }
  };

  ngObibaMica.search.PaginationState.prototype.update = function(pagination, hits) {
    this.totalHits = hits || null;
    this.initializeCurrentPage(pagination);
    this.updateRange();
    this.updatePageCount();
    this.updateMaxSize();
  };

  ngObibaMica.search.PaginationState.prototype.findPageSize = function (pageSize) {
    var result = pageSizes.filter(function (p) {
      return p.value === pageSize;
    }).pop();

    return result ? result : pageSizes[0];
  };

  ngObibaMica.search.PaginationState.prototype.totalHitsChanged = function(hits) {
    return null !== this.totalHits && this.totalHits !== hits;
  };

  ngObibaMica.search.PaginationState.prototype.updatePageCount = function() {
    this.pageCount = Math.ceil (this.totalHits / this.selected.value);
  };

  ngObibaMica.search.PaginationState.prototype.updateMaxSize = function() {
    this.maxSize = Math.min (3, this.pageCount);
  };

  ngObibaMica.search.PaginationState.prototype.data = function() {
    return {
      target: this.target,
      initialPageSize: this.initialPageSize,
      currentPage: this.currentPage,
      from: this.from,
      to: this.to,
      selected: this.selected,
      totalHits: this.totalHits,
      maxSize: this.maxSize,
      pageCount: this.pageCount,
      pageSizes: pageSizes
    };
  };

})();