/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {

  'use strict';

  ngObibaMica.search.PanelTaxonomyState = function(id) {
    var STATES = {
      NONE: 0,
      ACTIVE: 1,
      LOADING: 2
    };

    this.id = id;
    this.STATES = STATES;
    this.state = STATES.NONE;
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.isLoading = function() {
    return this.STATES.LOADING === (this.state & this.STATES.LOADING);
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.isActive = function() {
    return this.STATES.ACTIVE === (this.state & this.STATES.ACTIVE);
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.active = function() {
    this.state = this.state | this.STATES.ACTIVE;
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.inactive = function() {
    this.state = this.state & ~this.STATES.ACTIVE;
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.loading = function() {
    this.state = this.state | this.STATES.LOADING;
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.loaded = function() {
    this.state = this.state & ~this.STATES.LOADING;
  };

  ngObibaMica.search.PanelTaxonomyState.prototype.none = function() {
    this.state = this.STATES.NONE;
  };

})();
