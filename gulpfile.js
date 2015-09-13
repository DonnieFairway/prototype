// Gulp tasks for Prototype

// Load plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    prefix = require('gulp-autoprefixer'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    csslint = require('gulp-csslint'),
    browserSync = require('browser-sync').create(),
    browserReload = browserSync.reload;

// Minify all css files in the css directory
// Run this in the root directory of the project with `gulp minify-css `
gulp.task('minify-css', function(){
  gulp.src('./build/assets/css/app.css')
    .pipe(minifyCSS())
    .pipe(rename('app.min.css'))
    .pipe(size({gzip:true, showFiles: true}))
    .pipe(gulp.dest('./build/assets/css/'));
});

gulp.task('minify-img', function(){
  gulp.src('./source/assets/img/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(gulp.dest('./build/assets/img/'));
});

// Js files concate and uglify
gulp.task('script', function(){
    return gulp.src('./source/assets/js/*.js')
        .pipe(concat('app.js'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build/assets/js/'))
        .pipe(browserSync.stream({match: '**/*.js'}));
});

// Copy files
gulp.task('fonts', function () {
        return gulp.src(['source/assets/fonts/*'], {
            base: 'source'
        }).pipe(gulp.dest('build/'));
    });


// Use csslint without box-sizing or compatible vendor prefixes (these
// don't seem to be kept up to date on what to yell about)
gulp.task('csslint', function(){
  gulp.src('./css/app.css')
    .pipe(csslint({
          'compatible-vendor-prefixes': false,
          'box-sizing': false,
          'important': false,
          'known-properties': false
        }))
    .pipe(csslint.reporter());
});

// Task that compiles scss files down to good old css
gulp.task('pre-process', function(){
    return gulp.src("./source/assets/sass/app.scss")
        .pipe(sass())
        .on('error', swallowError)
        .pipe(prefix())
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('./build/assets/css/'))
        .pipe(minifyCSS())
        .pipe(rename('app.min.css'))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('./build/assets/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

// Clean all builds
gulp.task('clean', function() {
  var stream = gulp.src(['build/assets/'], {read: false})
    .pipe(clean());
  return stream;
});

// Initialize browser-sync which starts a static server also allows for
// browsers to reload on filesave
gulp.task('browser-sync', function() {
    browserSync.init({
        server: true
    });
});

// Allows gulp to not break after a sass error.
// Spits error out to console
function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}

/*
   DEFAULT TASK

 • Process sass then auto-prefixes and lints outputted css
 • Starts a server on port 3000
 • Reloads browsers when you change html or sass files

*/
gulp.task('default', ['pre-process', 'script', 'browser-sync'], function(){
  gulp.start('pre-process', 'script', 'csslint', 'minify-img', 'fonts');
  gulp.watch('source/assets/js/*', ['script']);
  gulp.watch('source/assets/sass/**/*', ['pre-process']);
  gulp.watch('*.html', browserReload);
});

