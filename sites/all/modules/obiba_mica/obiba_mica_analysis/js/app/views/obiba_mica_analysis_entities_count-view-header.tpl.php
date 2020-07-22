<!--
  ~ Copyright (c) 2018 OBiBa. All rights reserved.
  ~
  ~ This program and the accompanying materials
  ~ are made available under the terms of the GNU Public License v3.0.
  ~
  ~ You should have received a copy of the GNU General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->
<div ng-if="options.EntitiesCountHelpText">
  <div class="alert well alert-dismissible" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close" ng-click="closeHelpBox()"><span aria-hidden="true">&times;</span></button>
    <span ng-bind-html="options.EntitiesCountHelpText"></span>
  </div>
</div>

