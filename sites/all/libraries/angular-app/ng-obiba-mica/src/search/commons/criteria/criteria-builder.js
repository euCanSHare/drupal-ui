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

/* global RepeatableCriteriaItem */
/* global CriteriaItemBuilder */

/**
 * Class for all criteria builders
 * @param rootRql
 * @param rootItem
 * @param taxonomies
 * @param LocalizedValues
 * @param lang
 * @constructor
 */
function CriteriaBuilder(rootRql, rootItem, taxonomies, LocalizedValues, lang) {

  /**
   * Helper to get a builder
   * @returns {CriteriaItemBuilder}
   */
  this.newCriteriaItemBuilder = function () {
    return new CriteriaItemBuilder(LocalizedValues, lang);
  };

  this.initialize = function (target) {
    this.leafItemMap = {};
    this.target = target;
    this.rootRql = rootRql;
    this.taxonomies = taxonomies;
    this.LocalizedValues = LocalizedValues;
    this.lang = lang;
    this.rootItem = this.newCriteriaItemBuilder()
      .parent(rootItem)
      .type(this.target)
      .rqlQuery(this.rootRql)
      .target(this.target)
      .build();
  };

  /**
   * Called by the leaf visitor to create a criteria
   * @param targetTaxonomy
   * @param targetVocabulary
   * @param targetTerms
   * @param node
   */
  this.buildLeafItem = function (targetTaxonomy, targetVocabulary, targetTerms, node, parentItem) {
    var self = this;

    var builder = new CriteriaItemBuilder(self.LocalizedValues, self.lang)
      .type(node.name)
      .target(self.target)
      .taxonomy(targetTaxonomy)
      .vocabulary(targetVocabulary)
      .rqlQuery(node)
      .parent(parentItem);

    builder.selectedTerms(targetTerms).build();

    return builder.build();
  };

}

/**
 * Search for the taxonomy vocabulary corresponding to the provided field name. Can be defined either in the
 * vocabulary field attribute or be the vocabulary name.
 * @param field
 * @returns {{taxonomy: null, vocabulary: null}}
 */
CriteriaBuilder.prototype.fieldToVocabulary = function (field) {
  var found = {
    taxonomy: null,
    vocabulary: null
  };

  var normalizedField = field;
  if (field.indexOf('.') < 0) {
    normalizedField = 'Mica_' + this.target + '.' + field;
  }
  var parts = normalizedField.split('.', 2);
  var targetTaxonomy = parts[0];
  var targetVocabulary = parts[1];

  var foundTaxonomy = this.taxonomies.filter(function (taxonomy) {
    return targetTaxonomy === taxonomy.name;
  });

  if (foundTaxonomy.length === 0) {
    throw new Error('Could not find taxonomy:', targetTaxonomy);
  }

  found.taxonomy = foundTaxonomy[0];

  var foundVocabulary = found.taxonomy.vocabularies.filter(function (vocabulary) {
    return targetVocabulary === vocabulary.name;
  });

  if (foundVocabulary.length === 0) {
    throw new Error('Could not find vocabulary:', targetVocabulary);
  }

  found.vocabulary = foundVocabulary[0];

  return found;
};

/**
 * This method is where a criteria gets created
 */
CriteriaBuilder.prototype.visitLeaf = function (node, parentItem) {
  var match = RQL_NODE.MATCH === node.name;

  var field = node.args[match ? 1 : 0];
  var values = node.args[match ? 0 : 1];

  var searchInfo = this.fieldToVocabulary(field);
  var item =
      this.buildLeafItem(searchInfo.taxonomy,
          searchInfo.vocabulary,
          values instanceof Array ? values : [values],
          node,
          parentItem);

  var current = this.leafItemMap[item.id];

  if (current) {
    if (current.isRepeatable()) {
      current.addItem(item);
    } else {
      console.error('Non-repeatable criteria items must be unique,', current.id, 'will be overwritten.');
      current = item;
    }
  } else {
    current = item.vocabulary.repeatable ? new RepeatableCriteriaItem().addItem(item) : item;
  }

  this.leafItemMap[item.id] = current;
  parentItem.children.push(item);
};

/**
 * Returns all the criterias found
 * @returns {Array}
 */
CriteriaBuilder.prototype.getRootItem = function () {
  return this.rootItem;
};

/**
 * Returns the leaf criteria item map needed for finding duplicates
 * @returns {Array}
 */
CriteriaBuilder.prototype.getLeafItemMap = function () {
  return this.leafItemMap;
};

/**
 * Node condition visitor
 * @param node
 * @param parentItem
 */
CriteriaBuilder.prototype.visitCondition = function (node, parentItem) {
  var item = this.newCriteriaItemBuilder().parent(parentItem).rqlQuery(node).type(node.name).build();
  parentItem.children.push(item);

  this.visit(node.args[0], item);
  this.visit(node.args[1], item);
};

/**
 * Node not visitor
 * @param node
 * @param parentItem
 */
CriteriaBuilder.prototype.visitNot = function (node, parentItem) {
  var item = this.newCriteriaItemBuilder().parent(parentItem).rqlQuery(node).type(node.name).build();
  parentItem.children.push(item);

  this.visit(node.args[0], item);
};

/**
 * General purpose node visitor
 * @param node
 * @param parentItem
 */
CriteriaBuilder.prototype.visit = function (node, parentItem) {

  // TODO needs to add more types
  switch (node.name) {
    case RQL_NODE.NOT:
      this.visitNot(node, parentItem);
      break;
    case RQL_NODE.AND:
    case RQL_NODE.NAND:
    case RQL_NODE.OR:
    case RQL_NODE.NOR:
      this.visitCondition(node, parentItem);
      break;

    case RQL_NODE.CONTAINS:
    case RQL_NODE.IN:
    case RQL_NODE.OUT:
    case RQL_NODE.EQ:
    case RQL_NODE.LE:
    case RQL_NODE.LT:
    case RQL_NODE.GE:
    case RQL_NODE.GT:
    case RQL_NODE.BETWEEN:
    case RQL_NODE.EXISTS:
    case RQL_NODE.MISSING:
    case RQL_NODE.MATCH:
      this.visitLeaf(node, parentItem);
      break;
    case RQL_NODE.FILTER:
      break;
    default:
  }
};

/**
 * Builds a criteria list for this target
 */
CriteriaBuilder.prototype.build = function () {
  var self = this;
  this.rootRql.args.forEach(function (node) {
    self.visit(node, self.rootItem);
  });
};
