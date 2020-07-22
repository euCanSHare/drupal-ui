/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

mica.fileBrowser = angular.module('mica.fileBrowser', [
    'obiba.mica.fileBrowser'
  ]).config(['ngObibaMicaFileBrowserOptionsProvider',
  function(ngObibaMicaFileBrowserOptionsProvider){
    ngObibaMicaFileBrowserOptionsProvider.addExcludeFolder('data-collection-event');
    ngObibaMicaFileBrowserOptionsProvider.setOptions({documentsTitle: Drupal.settings.documentsTitle});
  }]);