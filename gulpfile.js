var browserSync = require("browser-sync");
var browserify = require("browserify");
var del = require("del");
var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var concat = require("gulp-concat");
var cssnano = require("gulp-cssnano");
var sass = require("gulp-sass");
var sourceStream = require("vinyl-source-stream");
// delete dist folder before build
gulp.task("clean", function() {
  return del.sync("dist");
});
// configure Browsersync task
gulp.task("browser-sync", function() {
  browserSync({
    // start dev server in app folder
    server: {baseDir: "app"},
    // default port
    port: 3001,
    // disable notifications
    notify: false
  })
});
// transform scss to css
gulp.task("scss", function() {
  // take files from folder and all subfolders
  return gulp.src("app/scss/**/*.{scss,sass}")
    // transform to css with gulp-sass plugin
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("app/css")) // output to css folder
    .pipe(browserSync.reload({stream: true})); // reload page
});
// concatenate and minify css
gulp.task("css", ["scss"], function() {
  // wait for scss task to end first
  return gulp.src("app/css/**/*.css")
    // add autoprefixes for old browsers
    .pipe(autoprefixer()) // list of browsers in package.json
    .pipe(concat("style.min.css")) // concatenate to one file
    .pipe(cssnano()) // minify output file
    .pipe(gulp.dest("app/css")) // output to css folder
    .pipe(browserSync.reload({stream: true})); // reload page
});
// browserify javascript in one bundle
gulp.task("js", function() {
  // main entry point to application
  return browserify("app/js/app.js")
    .bundle() // bundle in one file
    .pipe(sourceStream("bundle.js"))
    .pipe(gulp.dest("app/js")) // output to js folder
    .pipe(browserSync.reload({stream: true})); // reload page
});
// watch files for changes
gulp.task("watch", ["browser-sync", "scss", "css", "js"], function() {
  // reload browser page on change via Browsersync
  gulp.watch("app/scss/**/*.{scss,sass}", ["scss", "css"]);
  gulp.watch("app/js/**/*.js", ["js"]);
  // watch for index.html
  gulp.watch("app/*.html", browserSync.reload);
});
gulp.task("build", ["clean", "scss", "css", "js"], function() {
  // copy minified css to build folder
  var buildCss = gulp.src([
    "app/css/style.min.css"
  ]).pipe(gulp.dest("dist/css"));
  // copy javascript bundle
  var buildJs = gulp.src([
    "app/js/bundle.js"
  ]).pipe(gulp.dest("dist/js"));
  // copy index.html
  var buildHtml = gulp.src([
    "app/*.html"
  ]).pipe(gulp.dest("dist"));
});
gulp.task("default", ["watch"]);
