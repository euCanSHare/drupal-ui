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

interface IChiSquaredCalculator {
    compute(chiSquaredInfo);
}

class ChiSquaredCalculator implements IChiSquaredCalculator {

    public compute(chiSquaredInfo) {
        let Chisqcdf = null;
        const Z = chiSquaredInfo.sum;
        const DF = chiSquaredInfo.df;
        if (DF <= 0) {
           // console.log("Degrees of freedom must be positive");
        } else {
            Chisqcdf = this.gammacdf(Z / 2, DF / 2);
        }
        Chisqcdf = Math.round(Chisqcdf * 100000) / 100000;
        return Chisqcdf;
    }

    private logGamma(Z) {
        const S = 1 + 76.18009173 / Z - 86.50532033 / (Z + 1) + 24.01409822 / (Z + 2) - 1.231739516 / (Z + 3) +
            0.00120858003 / (Z + 4) - 0.00000536382 / (Z + 5);
        const LG = (Z - 0.5) * Math.log(Z + 4.5) - (Z + 4.5) + Math.log(S * 2.50662827465);
        return LG;
    }

    // Good for X>A+1.
    private gcf(X, A) {
        let A0 = 0;
        let B0 = 1;
        let A1 = 1;
        let B1 = X;
        let AOLD = 0;
        let N = 0;
        while (Math.abs((A1 - AOLD) / A1) > 0.00001) {
            AOLD = A1;
            N = N + 1;
            A0 = A1 + (N - A) * A0;
            B0 = B1 + (N - A) * B0;
            A1 = X * A0 + N * A1;
            B1 = X * B0 + N * B1;
            A0 = A0 / B1;
            B0 = B0 / B1;
            A1 = A1 / B1;
            B1 = 1;
        }
        const Prob = Math.exp(A * Math.log(X) - X - this.logGamma(A)) * A1;
        return 1 - Prob;
    }

    // Good for X<A+1.
    private gser(X, A) {
        let T9 = 1 / A;
        let G = T9;
        let I = 1;
        while (T9 > G * 0.00001) {
            T9 = T9 * X / (A + I);
            G = G + T9;
            I = I + 1;
        }
        G = G * Math.exp(A * Math.log(X) - X - this.logGamma(A));
        return G;
    }

    private gammacdf(x, a) {
        let GI;
        if (x <= 0) {
            GI = 0;
        } else if (x < a + 1) {
            GI = this.gser(x, a);
        } else {
            GI = this.gcf(x, a);
        }
        return GI;
    }

}

ngObibaMica.DatasetVariableCrosstab.service("ChiSquaredCalculator", [ChiSquaredCalculator]);
