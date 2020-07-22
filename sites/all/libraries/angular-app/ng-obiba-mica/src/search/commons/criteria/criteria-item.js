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

/* exported CriteriaItem */
function CriteriaItem(model) {
  var self = this;
  Object.keys(model).forEach(function (k) {
    self[k] = model[k];
  });
}

CriteriaItem.prototype.isRepeatable = function () {
  return false;
};

CriteriaItem.prototype.getTarget = function () {
  return this.target || null;
};

CriteriaItem.prototype.getRangeTerms = function () {
  var range = { from: null, to: null };

  if (this.type === RQL_NODE.BETWEEN) {
    range.from = this.selectedTerms[0];
    range.to = this.selectedTerms[1];
  } else if (this.type === RQL_NODE.GE) {
    range.from = this.selectedTerms[0];
    range.to = null;
  } else if (this.type === RQL_NODE.LE) {
    range.from = null;
    range.to = this.selectedTerms[0];
  }

  return range;
};
