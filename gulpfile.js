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
// transform sass/scss to css
gulp.task("sass", function() {
  /*
   * +(png|jpeg|gif) - glob pattern for multiple file extension
   * {png,jpeg,gif} - this works too
   */
  // take all scss/sass files from src/sass folder and all subfolders
  return gulp.src("src/sass/**/*.+(scss|sass)")
    .pipe(sass().on("error", sass.logError)) // transform to css with gulp-sass plugin
    .pipe(gulp.dest("src/css")); // output to css folder
});
// concatenate and minify css
gulp.task("css", ["sass"], function() {
  // wait for sass task to end first
  return gulp.src("src/css/**/*.css")
    // create autoprefixes for old browsers
    .pipe(autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {cascade: true}))
    .pipe(concat("style.min.css")) // concatenate to one file
    .pipe(cssnano()) // minify output file
    .pipe(gulp.dest("src/css")) // output to css folder
    .pipe(browserSync.reload({stream: true})); // reload page
})
// browserify javascript in one bundle
gulp.task("js", function() {
  // main entry point to application
  return browserify("src/js/app.js")
    .bundle() // bundle in one file
    .pipe(sourceStream("bundle.js"))
    .pipe(gulp.dest("src/js")) // output to js folder
    .pipe(browserSync.reload({stream: true})); // reload page
});
// copy index.html and favicon to dist
/*
gulp.task("html", function() {
  return gulp.src("src/*.+(html|ico)")
    .pipe(gulp.dest("dist")) // simply copy to dist
    .pipe(browserSync.reload({stream: true})) // reload page
});
*/
// watch files for changes
gulp.task("watch", function() {
  // reload browser page on change via browser-sync
  gulp.watch("src/sass/**/*.+(scss|sass)", ["sass", "css"]);
  gulp.watch("src/js/**/*.js", ["js"]);
  gulp.watch("src/*.html", browserSync.reload()) // watch for index.html
});
// configure browser-sync task
gulp.task("browser-sync", function() {
  browserSync({
    server: {
      // start server in dist folder
      baseDir: "src"
    },
    // disable notifications
    notify: false
  })
});
