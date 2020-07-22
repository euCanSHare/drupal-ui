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

interface IContingencyService {
    removeVariableFromUrl(path: string): string;
    getCrossDownloadUrl(path: string): string;
    createVariableUrlPart(var1: string, var2: string): string;
}

class ContingencyService implements IContingencyService {

    public removeVariableFromUrl(path) {
        return path.replace(/\/variable\/.*/, "");
    }

    public getCrossDownloadUrl(params) {
        return this.searchReplace(":dsType/:dsId/download_:docType/cross/:v1/by/:v2/ws", params);
    }

    public createVariableUrlPart(var1, var2) {
        return this.searchReplace("variable/:var/by/:by", {
            ":by": var2,
            ":var": var1,
        });
    }

    private searchReplace(pattern, params) {
        return pattern.replace(/:\w+/g, (all) => {
            return params[all] || all;
        });
    }

}

ngObibaMica.DatasetVariableCrosstab.service("ContingencyService", [ContingencyService]);
