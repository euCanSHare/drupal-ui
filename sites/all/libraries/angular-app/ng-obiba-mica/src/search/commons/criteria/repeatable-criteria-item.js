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

/* global CriteriaItem */
/* exported RepeatableCriteriaItem */
function RepeatableCriteriaItem() {
  CriteriaItem.call(this, {});
  this.list = [];
}

RepeatableCriteriaItem.prototype = Object.create(CriteriaItem.prototype);

RepeatableCriteriaItem.prototype.isRepeatable = function () {
  return true;
};

RepeatableCriteriaItem.prototype.addItem = function (item) {
  this.list.push(item);
  return this;
};

RepeatableCriteriaItem.prototype.items = function () {
  return this.list;
};

RepeatableCriteriaItem.prototype.first = function () {
  return this.list[0];
};

RepeatableCriteriaItem.prototype.getTarget = function () {
  return this.list.length > 0 ? this.list[0].getTarget() : null;
};

