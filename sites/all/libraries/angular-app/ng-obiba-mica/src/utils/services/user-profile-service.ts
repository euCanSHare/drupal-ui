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

interface IUserProfileService {
  getAttribute(profile: any, key: string): string;

  getFullName(profile: any): string;

  getEmail(profile: any): string;

}

class UserProfileService implements IUserProfileService {

  public getAttribute(attributes: any[], key: string): string {
    return this.getAttibuteValue(attributes, key);
  }

  public getFullName(profile: any): string {
    const firstName = this.getProfileAttributeValue(profile, "firstName");
    const lastName = this.getProfileAttributeValue(profile, "lastName");
    return firstName && lastName ? firstName + " " + lastName : null;
  }

  public getEmail(profile: any): string {
    return this.getProfileAttributeValue(profile, "email");
  }

  private getProfileAttributeValue(profile: any, key: string) {
    if (profile) {
      return this.getAttibuteValue(profile.attributes, key);
    }

    return null;
  }

  private getAttibuteValue(attributes: any[], key: string) {
    if (attributes) {
      const result = attributes.filter((attribute: any) => {
        return attribute.key === key;
      });

      return result && result.length > 0 ? result[0].value : null;
    }

    return null;
  }
}

ngObibaMica.utils.service("UserProfileService", UserProfileService);
