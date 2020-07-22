var gulp = require('gulp');
var path = require('path');
var inject = require('gulp-inject-string');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var fs = require('fs');
var del = require('del');
var jsonminify = require('gulp-jsonminify');

gulp.task('default', ['clean:all','copy:json', 'generate:all', 'create:all']);

gulp.task('clean:all', function () {
  del(['tmp/*','dist/*']);
});

gulp.task('copy:json', function() {
  var files = JSON.parse(fs.readFileSync('./sources.json', 'utf-8'));
  files.forEach(function (file) {
    gulp.src(file)
      .pipe(rename(path.basename(file) + '.json'))
      .pipe(jsonminify())
      .pipe(gulp.dest('dist'));
  });
});

gulp.task('generate:all', function() {
  // TODO find a better way of chaining this task to 'create:all'
  var files = JSON.parse(fs.readFileSync('./sources.json', 'utf-8'));
  files.forEach(function(file){
    gulp.src(file)
      .pipe(inject.prepend('OBiBa.CountryCodes.' + path.basename(file) + ' = '))
      .pipe(inject.append(';'))
      .pipe(gulp.dest('tmp'));
  });

});

gulp.task('create:all', function () {
  // HACK to make sure all files are generated
  setTimeout(function() {
    gulp.src('./tmp/*')
      .pipe(concat('all.js'))
      .pipe(inject.prepend('var OBiBa ={}; OBiBa.CountryCodes = {};'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('all.min.js'))
      .pipe(gulp.dest('dist'));
  }, 1000);

});
