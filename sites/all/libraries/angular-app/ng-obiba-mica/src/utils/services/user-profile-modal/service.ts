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

interface IUserProfileModalService {
  show(profile): void;
}

class UserProfileModalService implements IUserProfileModalService {
  private static $inject = ["$uibModal", "UserProfileService"];

  constructor(private $uibModal: any, private UserProfileService: any) {
  }

  public show(profile): void {
    const applicant = {
      email: this.UserProfileService.getEmail(profile),
      fullName: this.UserProfileService.getFullName(profile),
      profile,
    };

    this.$uibModal.open ({
      controller: ["$scope", ($scope) => $scope.applicant = applicant],
      templateUrl: "utils/services/user-profile-modal/service.html",
    });
  }
}

ngObibaMica.utils.service("UserProfileModalService", UserProfileModalService);
