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

ngObibaMica.fileBrowser
  .controller('FileBrowserController', [
    '$rootScope',
    '$scope',
    '$log',
    '$filter',
    'StringUtils',
    'FileBrowserService',
    'BrowserBreadcrumbHelper',
    'AlertService',
    'ServerErrorUtils',
    'FileBrowserFileResource',
    'FileBrowserSearchResource',
    'ngObibaMicaFileBrowserOptions',
    'FileBrowserDownloadService',
    'CustomWatchDomElementService',
    function ($rootScope,
              $scope,
              $log,
              $filter,
              StringUtils,
              FileBrowserService,
              BrowserBreadcrumbHelper,
              AlertService,
              ServerErrorUtils,
              FileBrowserFileResource,
              FileBrowserSearchResource,
              ngObibaMicaFileBrowserOptions,
              FileBrowserDownloadService,
              CustomWatchDomElementService) {

      var navigateToPath = function (path, keyToken) {
        clearSearchInternal();
        getDocument(path, keyToken);
      };

      var navigateTo = function (event, document, keyToken) {
        event.stopPropagation();
        if (document) {
          navigateToPath(document.path, keyToken);
        }
      };

      var onError = function (response) {
        AlertService.alert({
          id: 'FileSystemController',
          type: 'danger',
          msg: ServerErrorUtils.buildMessage(response)
        });

        if (response.status !== 403 && $scope.data.document) {
          navigateTo($scope.data.document);
        }
      };

      function clearSearchInternal() {
        $scope.data.search.text = null;
        $scope.data.search.active = false;
      }

      function getDocument(path, keyToken) {
        var fileParam;
        $scope.data.search.active = false;
        if (keyToken) {
          fileParam = {path: path, keyToken: keyToken};
        }
        else {
          fileParam = {path: path};
        }
        FileBrowserFileResource.get(fileParam,
          function onSuccess(response) {
          if(response.code !== 404){
            $scope.pagination.selected = -1;
            $scope.data.document = $scope.data.details.document = response;

            if (!$scope.data.document.children) {
              $scope.data.document.children = [];
            }
            if (keyToken) {
              $scope.data.document.keyToken = keyToken;
            }
            if ($scope.data.document.path === $scope.data.rootPath) {
              $scope.data.document.children = $scope.data.document.children.filter(function (child) {
                return ngObibaMicaFileBrowserOptions.folders.excludes.indexOf(child.name) < 0;
              });
              $scope.data.document.size = $scope.data.document.children.length;
            }

            $scope.data.breadcrumbs = BrowserBreadcrumbHelper.toArray(path, $scope.data.rootPath);
            $scope.data.isFile = FileBrowserService.isFile(response);
            $scope.data.isRoot = FileBrowserService.isRoot(response);
            $scope.noDocument = false;
            if(response.type === 'FOLDER' && response.size < 1){
              $scope.noDocument = true;
            }
          }
          else{
            $scope.noDocument = true;
          }
          },
          onError
        );
      }

      function navigateToParent(event, document, keyToken) {
        event.stopPropagation();
        var path = document.path;

        if (path.lastIndexOf('/') === 0) {
          path = '/';
        } else {
          path = path.substring(0, path.lastIndexOf('/'));
        }

        navigateToPath(path, keyToken);
      }

      function navigateBack() {
        if (!$scope.data.isRoot && $scope.data.document) {
          var parentPath = $scope.data.document.path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
          getDocument(parentPath ? parentPath : '/');
        }
      }

      function hideDetails() {
        $scope.pagination.selected = -1;
        $scope.data.details.show = false;
      }

      function searchDocumentsInternal(path, searchParams) {
        function excludeFolders(query) {
          var excludeQuery = '';
          try {
            var excludes = [];
            ngObibaMicaFileBrowserOptions.folders.excludes.forEach(function (exclude) {
              var q = path.replace(/\//g, '\\/') + '\\/' + exclude.replace(/\s/, '\\ ');
              excludes.push(q);
              excludes.push(q + '\\/*');
            });

            excludeQuery = excludes.length > 0 ? 'NOT path:(' + excludes.join(' OR ') + ')' : '';
          } catch (error) {
            // just return the input query
          }

          return query ? query + ' AND ' + excludeQuery : excludeQuery;
        }

        searchParams.query = excludeFolders(searchParams.query);

        var urlParams = angular.extend({}, {path: path}, searchParams);

        FileBrowserSearchResource.search(urlParams,
          function onSuccess(response) {
            var clone = $scope.data.document ? angular.copy($scope.data.document) : {};
            clone.children = response;
            $scope.data.document = clone;
          },
          function onError(response) {
            $log.debug('ERROR:', response);
          }
        );
      }

      var searchDocuments = function (query) {
        $scope.data.search.active = true;
        hideDetails();
        var recursively = $scope.data.search.recursively;
        var orderBy = null;
        var sortBy = null;
        var limit = 999;
        $scope.data.search.query = query;

        switch (query) {
          case 'RECENT':
            query = '';
            orderBy = 'desc';
            sortBy = 'lastModifiedDate';
            limit = 10;
            break;
        }

        var searchParams = {query: query, recursively: recursively, sort: sortBy, order: orderBy, limit: limit};
        searchDocumentsInternal($scope.data.document.path, searchParams);
      };

      var toggleRecursively = function () {
        $scope.data.search.recursively = !$scope.data.search.recursively;
        if ($scope.data.search.text) {
          searchDocuments($scope.data.search.text);
        } else if ($scope.data.search.query) {
          searchDocuments($scope.data.search.query);
        }
      };

      var clearSearch = function () {
        clearSearchInternal();
        getDocument($scope.data.document.path);
      };

      var searchKeyUp = function (event) {
        switch (event.keyCode) {
          case 13: // ENTER
            if ($scope.data.search.text) {
              searchDocuments($scope.data.search.text);
            } else {
              clearSearch();
            }
            break;

          case 27: // ESC
            if ($scope.data.search.active) {
              clearSearch();
            }
            break;
        }
      };

      var showDetails = function (document, index) {
        $scope.pagination.selected = index;
        $scope.data.details.document = document;
        $scope.data.details.show = true;
      };

      var getTypeParts = function (document) {
        return FileBrowserService.isFile(document) && document.attachment.type ?
          document.attachment.type.split(/,|\s+/) :
          [];
      };

      var getLocalizedValue = function (values) {
        return FileBrowserService.getLocalizedValue(values, ngObibaMicaFileBrowserOptions.locale);
      };

      var hasLocalizedValue = function (values) {
        return FileBrowserService.hasLocalizedValue(values, ngObibaMicaFileBrowserOptions.locale);
      };

      var refresh = function (docPath, docId) {
        if (docPath && docId) {
          $scope.docPath = docPath;
          $scope.docId = docId;
        }
        if (($scope.docPath && $scope.docPath !== '/') && $scope.docId) {
          $scope.data.docRootIcon = BrowserBreadcrumbHelper.rootIcon($scope.docPath);
          $scope.data.rootPath = $scope.docPath + ($scope.docId !== 'null' ? '/' + $scope.docId : '');
          if ($scope.tokenKey) {
            getDocument($scope.data.rootPath, $scope.tokenKey, null);
          }
          else {
            getDocument($scope.data.rootPath, null);
          }
        }
      };

      $scope.downloadTarget = ngObibaMicaFileBrowserOptions.downloadInline ? '_blank' : '_self';
      $scope.getDownloadUrl = FileBrowserDownloadService.getUrl;
      $scope.screen = $rootScope.screen;
      $scope.truncate = StringUtils.truncate;
      $scope.getDocumentIcon = FileBrowserService.getDocumentIcon;
      $scope.navigateToPath = navigateToPath;
      $scope.navigateTo = navigateTo;
      $scope.navigateBack = navigateBack;
      $scope.navigateToParent = navigateToParent;
      $scope.clearSearch = clearSearch;
      $scope.searchDocuments = searchDocuments;
      $scope.toggleRecursively = toggleRecursively;
      $scope.searchKeyUp = searchKeyUp;
      $scope.isFile = FileBrowserService.isFile;
      $scope.isRoot = FileBrowserService.isRoot;
      $scope.getLocalizedValue = getLocalizedValue;
      $scope.hasLocalizedValue = hasLocalizedValue;
      $scope.hideDetails = hideDetails;
      $scope.showDetails = showDetails;
      $scope.getTypeParts = getTypeParts;
      $scope.documentsTitle = ngObibaMicaFileBrowserOptions.documentsTitle;

      $scope.pagination = {
        selected: -1,
        currentPage: 1,
        itemsPerPage: 20
      };

      $scope.data = {
        keyToken: null,
        details: {
          document: null,
          show: false
        },
        docRootIcon: null,
        rootPath: null,
        document: null,
        accesses: [],
        search: {
          text: null,
          active: false,
          recursively: true
        },
        breadcrumbs: null,
        isFile: false,
        isRoot: false,
        editDescField: false
      };

      $scope.$watchGroup(['docPath', 'docId'], function () {
        refresh();
      });

      $scope.__defineSetter__('selfNode', function (selfNode) {
        if (selfNode) {
          CustomWatchDomElementService.configWatch(selfNode, ['refresh', 'show-title']).customWatch(function () {
            if(selfNode.attributes[4].value === 'true'){
              refresh(selfNode.attributes[1].value, selfNode.attributes[2].value);
              $scope.showTitle = selfNode.attributes[6].value;
            }
          });
        }

      });

    }]);
