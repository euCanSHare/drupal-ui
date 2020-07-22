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

module.exports = function (grunt) {

  grunt.initConfig({

    tslint: {
      options: {
        // can be a configuration object or a filepath to tslint.json
        configuration: 'tslint.json',
        // If set to true, tslint errors will be reported, but not fail the task
        // If set to false, tslint errors will be reported, and the task will fail
        force: false,
        fix: false
      },
      files: {
        src: ['src/**/*.ts']
      }
    },

    ts: {
      default : {
        src: ['./src/**/*.ts','./src/**/*.js'],
        outDir: './built',
        options: {
          rootDir: './src',
          allowJs: true,
          target: 'es5',
          sourceMap: true,
          removeComments: false,
          verbose: false
        }
      }
    },

    meta: {
      pkg: grunt.file.readJSON('package.json'),
      src: {
        js: [
          // order is important!
          'built/ng-obiba-mica.js',
          'built/utils/utils.js',
          'built/utils/services/**/*.js',
          'built/utils/custom-watch-dom-element-service.js',
          'built/utils/components/**/*.js',
          'built/file/file.js',
          'built/file/file-filter.js',
          'built/file/file-service.js',
          'built/attachment/attachment.js',
          'built/attachment/attachment-directives.js',
          'built/access/data-access-request.js',
          'built/access/components/**/*.js',
          'built/access/services/**/*.js',
          'built/access/data-access-request-controller.js',
          'built/access/controllers/**/*js',
          'built/access/data-access-request-router.js',
          'built/access/data-access-request-service.js',
          'built/access/data-access-request-directive.js',
          'built/sets/sets.js',
          'built/sets/providers/**/*.js',
          'built/sets/rest/**/*.js',
          'built/sets/services/**/*.js',
          'built/sets/commons/**/*.js',
          'built/sets/components/**/*.js',
          'built/sets/sets-controller.js',
          'built/sets/sets-router.js',
          'built/search/search.js',
          'built/search/providers/**/*.js',
          'built/search/commons/**/*.js',
          'built/search/rest/**/*.js',
          'built/search/search-controller.js',
          'built/search/search-router.js',
          'built/search/options/**/*.js',
          'built/search/services/**/*.js',
          'built/search/filters/**/*.js',
          'built/search/components/**/*.js',
          'built/analysis/crosstab/dataset-variable-crosstab.js',
          'built/analysis/crosstab/dataset-variable-crosstab-controller.js',
          'built/analysis/crosstab/dataset-variable-crosstab-filter.js',
          'built/analysis/crosstab/dataset-variable-crosstab-router.js',
          'built/analysis/analysis.js',
          'built/analysis/providers/**/*.js',
          'built/analysis/rest/**/*.js',
          'built/analysis/analysis-controller.js',
          'built/analysis/analysis-router.js',
          'built/analysis/services/**/*.js',
          'built/analysis/components/**/*.js',
          'built/lists/lists.js',
          'built/lists/lists-service.js',
          'built/lists/lists-controller.js',
          'built/lists/lists-directive.js',
          'built/lists/components/**/*.js',
          'built/graphics/graphics.js',
          'built/graphics/graphics-directive.js',
          'built/graphics/graphics-controller.js',
          'built/graphics/graphics-service.js',
          'built/localized/localized.js',
          'built/localized/localized-directives.js',
          'built/localized/localized-service.js',
          'built/localized/localized-filter.js',
          'built/file-browser/file-browser.js',
          'built/file-browser/file-browser-directive.js',
          'built/file-browser/file-browser-controller.js',
          'built/file-browser/file-browser-service.js'
        ]
      }
    },

    less: {
      development: {
        options: {
          sourceMap: true,
          sourceMapBasepath: '"dist/css/',
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "dist/css/ng-obiba-mica.css": ["less/ng-obiba-mica.less", "src/**/components/**/*.less"] // destination file and source file
        }
      }
    },

    clean: {
      build: ['<%= destination_dir %>/bower_components', 'tmp', 'dist', 'built'],
      tmp: ['tmp']
    },

    /* convert AngularJs html templates to cached JavaScript */
    html2js: {
      ngObibaMica: {
        options: {},
        src: ['src/**/*.html'],
        dest: 'tmp/<%= meta.pkg.name %>.templates.js'
      }
    },

    concat: {
      options: {
        separator: '\n',
        banner: '/*!\n' +
        ' * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n' +
        ' * <%= meta.pkg.homepage %>\n *\n' +
        ' * License: <%= meta.pkg.license %>\n' +
        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' */\n'
      },
      dist: {
        src: ['<%= meta.src.js %>', 'tmp/*.js'],
        dest: 'dist/<%= meta.pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        // Preserve banner
        preserveComments: 'some'
      },
      dist: {
        files: {
          'dist/<%= meta.pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['src/**/*.js'],
      options: {
        jshintrc: '.jshintrc',
        reporterOutput: ''
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'images/',
          dest: 'dist/images/',
          src: ['**']
        }, {
          expand: true,
          dot: true,
          cwd: 'fonts/',
          dest: 'dist/fonts/',
          src: ['**']
        }]
      }
    },
    watch: {
        files: [
          'src/**/*.html',
          'src/**/*.js',
          'src/**/*.ts',
          'less/**/*.less'
        ],
        tasks: ['default']
    }
  });

  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // TODO uncomment below and remove last line once unit tests are implemented
  // grunt.registerTask('default', ['clean:build', 'less', 'jshint', 'html2js', 'concat', 'clean:tmp', 'uglify', 'copy']);
  grunt.registerTask('default', ['clean:build', 'tslint', 'ts', 'less', 'jshint', 'html2js', 'concat', 'clean:tmp', 'uglify', 'copy']);
  grunt.registerTask('watchChanges', ['default', 'watch']);
};
