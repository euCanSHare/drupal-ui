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
  function CriteriaReducer() {}

  /**
   * Reduce the current query such that all irrelevant criteria is removed but the criterion. The exceptions are
   * when the criterion is inside an AND, in this case this latter is reduced.
   *
   * @param parentItem
   * @param criteriaItem
   */
  CriteriaReducer.reduce = function(parentItem, criteriaItem) {
    if (parentItem.type === RQL_NODE.OR) {
      var grandParentItem = parentItem.parent;
      var parentItemIndex = grandParentItem.children.indexOf(parentItem);
      grandParentItem.children[parentItemIndex] = criteriaItem;

      var parentRql = parentItem.rqlQuery;
      var grandParentRql = grandParentItem.rqlQuery;
      var parentRqlIndex = grandParentRql.args.indexOf(parentRql);
      grandParentRql.args[parentRqlIndex] = criteriaItem.rqlQuery;

      if (grandParentItem.type !== QUERY_TARGETS.VARIABLE) {
        CriteriaReducer.reduce(grandParentItem, criteriaItem);
      }
    } else if (criteriaItem.type !== RQL_NODE.VARIABLE && parentItem.type === RQL_NODE.AND) {
      // Reduce until parent is Variable node or another AND node
      CriteriaReducer.reduce(parentItem.parent, parentItem);
    }
  };

  ngObibaMica.search.CriteriaReducer = CriteriaReducer;
})();
