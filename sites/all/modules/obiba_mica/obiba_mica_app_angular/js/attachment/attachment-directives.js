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
(function ($) {
  Drupal.behaviors.obiba_angular_app_attachement_directives = {
    attach: function (context, settings) {

      mica.attachment

        .directive('attachmentList', [function () {

          return {
            restrict: 'E',
            scope: {
              hrefBuilder: '&',
              files: '='
            },
            templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_app_angular_attachment-list-template',
            link: function (scope) {
              scope.attachments = [];
              scope.hrefBuilder = scope.hrefBuilder || function (a) { return a.id; };

              scope.$watch('files', function (val) {
                if (val) {
                  scope.attachments = val.map(function (a) {
                    var temp = angular.copy(a);
                    temp.href = scope.hrefBuilder({id: a.id});
                    return temp;

                  });
                }
              }, true);
            }
          };
        }])
        .directive('attachmentInput', [function () {
          return {
            restrict: 'E',
            require: '^form',
            scope: {
              multiple: '=',
              accept: '@',
              files: '='
            },
            templateUrl: Drupal.settings.basePath + 'obiba_mica_app_angular_view_template/obiba_mica_app_angular_attachment-input-template',
            controller: 'AttachmentCtrl'
          };
        }])
        .controller('AttachmentCtrl', ['$scope', '$timeout', '$log', 'Upload', 'TempFileResource',
          function ($scope, $timeout, $log, Upload, TempFileResource) {
            $scope.onFileSelect = function (file) {
              $scope.uploadedFiles = file;
              $scope.uploadedFiles.forEach(function (f) {
                uploadFile(f);
              });
            };

            var uploadFile = function (file) {
              var attachment = {
                showProgressBar: true,
                lang: 'en',
                progress: 0,
                fileName: file.name,
                size: file.size
              };

              if ($scope.multiple) {
                $scope.files.push(attachment);
              } else {
                $scope.files.splice(0, $scope.files.length);
                $scope.files.push(attachment);
              }
              $scope.upload = Upload
                .upload({
                  url: 'request/upload-file',
                  method: 'POST',
                  file: file
                })
                .progress(function (evt) {
                  attachment.progress = parseInt(100.0 * evt.loaded / evt.total);
                })
                .success(function (data, status, getResponseHeaders) {
//            var parts = getResponseHeaders().location.split('/')?getResponseHeaders().location.split('/'):data.message;
//            var fileId = parts[parts.length - 1];
                  var fileId = data.message;
                  TempFileResource.get(
                    {id: fileId},
                    function (tempFile) {
                      attachment.id = tempFile.id;
                      attachment.md5 = tempFile.md5;
                      attachment.justUploaded = true;
                      // wait for 1 second before hiding progress bar
                      $timeout(function () { attachment.showProgressBar = false; }, 1000);
                    }
                  );
                });
            };

            $scope.deleteTempFile = function (tempFileId) {
              TempFileResource.delete(
                {id: tempFileId},
                function () {
                  for (var i = $scope.files.length; i--;) {
                    var attachment = $scope.files[i];
                    if (attachment.justUploaded && attachment.id === tempFileId) {
                      $scope.files.splice(i, 1);
                    }
                  }
                }
              );
            };

            $scope.deleteFile = function (fileId) {
              for (var i = $scope.files.length; i--;) {
                if ($scope.files[i].id === fileId) {
                  $scope.files.splice(i, 1);
                }
              }
            };
          }
        ]);

    }
  }
}(jQuery));
