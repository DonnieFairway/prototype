// Gulp tasks for PROTOTYPE

// Load plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    prefix = require('gulp-autoprefixer'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    uncss = require('gulp-uncss'),
    sass = require('gulp-sass'),
    csslint = require('gulp-csslint'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    browserReload = browserSync.reload;

// Clean
gulp.task('clean', function() {
  return del('build/**/*');
});

// Copy all assets
gulp.task('copy', function(){
  return gulp.src('src/assets/**/*', { base: 'src' })
    .pipe(gulp.dest('build/'));
});

// Run uncss to remove unused classes
gulp.task('uncss', ['pre-process'], function () {
    return gulp.src('build/*.css')
        .pipe(uncss({
            html: ['build/*.html']
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('build'));
});

// Minify images
gulp.task('minify-img', function(){
  gulp.src('build/assets/img/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(gulp.dest('build/assets/img'));
});

// Use csslint without box-sizing or compatible vendor prefixes (these
// don't seem to be kept up to date on what to yell about)
gulp.task('csslint', function(){
  gulp.src('build/main.min.css')
    .pipe(csslint({
          'compatible-vendor-prefixes': false,
          'box-sizing': false,
          'important': false,
          'known-properties': false
        }))
    .pipe(csslint.reporter());
});

// Task that compiles scss files down to good old css
gulp.task('pre-process', function() {
    return gulp.src('src/sass/main.scss')
      .pipe(sass())
      .on('error', swallowError)
      .pipe(prefix())
      .pipe(size({gzip: true, showFiles: true}))
      //.pipe(gulp.dest('build'))
      .pipe(minifyCSS())
      .pipe(rename('main.min.css'))
      .pipe(size({gzip: true, showFiles: true}))
      .pipe(gulp.dest('build'))
      .pipe(browserSync.stream({match: '**/*.css'}));
});

// Concat js and use jslint and uglify
gulp.task('scripts', function() {
  return gulp.src(['src/scripts/libs/**/*.js', 'src/scripts/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('app.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

// File include for HTML partials and such
gulp.task('views', function() {
  gulp.src(['src/views/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'src/views/includes/'
    }))
    .pipe(gulp.dest('build'));
});

// Initialize browser-sync which starts a static server also allows for
// browsers to reload on filesave
gulp.task('browser-sync', function() {
    browserSync.init({
        server: 'build',
        // Open the site in Chrome
        browser: "google chrome",
        open: false
    });
});

// Allows gulp to not break after a sass error.
// Spits error out to console
function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}

/*
  GULP WATCH
*/
gulp.task('watch', function(){
  gulp.watch('src/assets/**/*', ['copy']);
  gulp.watch('src/sass/**/*.scss', ['pre-process']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/views/**/*', ['views']);
  gulp.watch('build/*.html', browserReload); 
});

/*
   DEFAULT TASK

 • Process sass then auto-prefixes and lints outputted css
 • Starts a server on port 3000
 • Reloads browsers when you change html or sass files

*/
gulp.task('default', ['browser-sync', 'clean', 'copy', 'views', 'pre-process', 'scripts', 'csslint', 'watch']);

gulp.task('build', ['clean', 'copy', 'views', 'pre-process', 'uncss', 'scripts', 'minify-img']);