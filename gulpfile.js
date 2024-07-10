import gulp from "gulp";
import concat from "gulp-concat";
import autoPrefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import uglify from "gulp-uglify";
import { deleteSync } from "del";
import browserSync from "browser-sync";
import imagemin from "gulp-imagemin";
import gcmq from "gulp-group-css-media-queries";
import sourcemaps from "gulp-sourcemaps";
import babel from "gulp-babel";

const sass = gulpSass(dartSass);

async function styles() {
    return gulp.src("./src/scss/main.scss")
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))  // Use gulp-sass here
      .pipe(gcmq())
      .pipe(concat("main.css"))
      .pipe(autoPrefixer({
        overrideBrowserslist: ["> 1%", "last 2 versions"],
        cascade: false
      }))
      .pipe(cleanCSS({
        level: 2
      }))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest("./build/css"))
      .pipe(browserSync.stream());
}

async function scripts() {
  return gulp.src("./src/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat("main.js"))
    .pipe(babel({
      presets: ["@babel/env"]
    }))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./build/js"))
    .pipe(browserSync.stream());
}

async function img() {
  return gulp.src("./src/img/**/*")
    .pipe(imagemin().on("error", function(err) {
      console.error(err.message, '❌');
    }))
    .pipe(gulp.dest("./build/img"));
}


async function clean() {
  return deleteSync(["./build/*"]);
}

async function fonts() {
  return gulp.src("./src/fonts/*")
    .pipe(gulp.dest("./build/fonts"));
}

async function htmls() {
  return gulp.src("./src/*.html")
    .pipe(gulp.dest("./build/"))
    .pipe(browserSync.stream());
}

async function watch() {
  browserSync.init({
    server: { baseDir: "./build" },
    tunnel: false,
    port: 3200
  });

  gulp.watch("./src/scss/**/*.scss", styles);
  gulp.watch("./src/js/**/*.js", scripts);
  gulp.watch("./src/*.html", htmls);
  gulp.watch("./*.html").on("change", browserSync.reload);
}

gulp.task("watch", watch);

gulp.task("build", gulp.series(clean, gulp.parallel(htmls, styles, scripts, img, fonts)));

gulp.task("dev", gulp.series("build", "watch"));