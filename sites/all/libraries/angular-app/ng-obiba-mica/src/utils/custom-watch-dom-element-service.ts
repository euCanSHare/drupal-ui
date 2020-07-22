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

interface ICustomWatchDomElementService {
    configWatch(node, attributes): void;
    customWatch(callback): void;
}

class CustomWatchDomElementService implements ICustomWatchDomElementService {

    private node;
    private attributes = [];
    private config: object;

    constructor() {
        const that = this;
    }

    public configWatch(node: object, attributes: any) {
        this.node = node;
        this.attributes = attributes;
        this.config = {attributeFilter: this.attributes};
        return this;
    }

    public customWatch(callback) {
        const observable = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes") {
                    callback();
                }
            }
        };
        const observer = new MutationObserver(observable);
        observer.observe(this.node, this.config);
    }
}

ngObibaMica.utils.service("CustomWatchDomElementService", [CustomWatchDomElementService]);
