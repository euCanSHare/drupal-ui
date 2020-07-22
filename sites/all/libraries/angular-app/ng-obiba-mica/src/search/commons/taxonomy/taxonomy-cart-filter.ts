/*
 * Copyright (c) 2019 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class TaxonomyCartFilter {

  public static filter(SetService: ISetService, taxonomy: any, $translate: any) {
    const cartSet = SetService.getCartSet(targetToType(taxonomy.name.split("Mica_")[1]));
    (taxonomy.vocabularies || []).filter((vocabulary) => vocabulary.name === "sets")
      .forEach((setsVocabulary) => {
        if (Array.isArray(setsVocabulary.terms)) {
          const filteredTerms = setsVocabulary.terms.filter((term) => {
            if (cartSet && term.name === cartSet.id) {
              $translate(["sets.cart.title"]).then((translation) => {
                term.title = [ {locale: $translate.use(), text: translation["sets.cart.title"]} ];
              });
            }
            return Array.isArray(term.title) || (cartSet && term.name === cartSet.id);
          });

          setsVocabulary.terms = filteredTerms.length > 0 ? filteredTerms : null;
        }
      });

  }
}
