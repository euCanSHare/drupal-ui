var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var streamqueue = require('streamqueue');
var fs = require('fs');

gulp.task('default', ['minify']);
gulp.task('run', ['minify']);

gulp.task('reload', ['minify'], function () {
  gulp.src('./dist/**/*.*').pipe(connect.reload());
});

gulp.task('minify', function () {
  var files = JSON.parse(fs.readFileSync('sources.json', 'utf-8'));
  var stream = gulp.src(files)
    .pipe(concat('obiba-shims.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename('obiba-shims.min.js'))
    .pipe(gulp.dest('./dist'));

  return stream;
});
