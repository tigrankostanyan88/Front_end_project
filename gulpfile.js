import gulp from 'gulp';
import concat from 'gulp-concat';
import autoPrefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import uglify from 'gulp-uglify';
import { deleteSync } from 'del';
import browserSync from 'browser-sync';
import imagemin from 'gulp-imagemin';
import gcmq from 'gulp-group-css-media-queries';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';

// Initialize gulp-sass with the updated sass compiler
const sassCompiler = gulpSass(sass);

const paths = {
  styles: {
    src: './src/scss/main.scss',
    dest: './build/css'
  },
  scripts: {
    src: './src/js/**/*.js',
    dest: './build/js'
  },
  images: {
    src: './src/img/**/*',
    dest: './build/img'
  },
  html: {
    src: './src/*.html',
    dest: './build/'
  },
  clean: './build/*'
};

// Styles task
async function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sassCompiler().on('error', sassCompiler.logError))  // Use updated sass compiler
    .pipe(gcmq())
    .pipe(concat('main.css'))
    .pipe(autoPrefixer({
      overrideBrowserslist: ['> 1%', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Scripts task
async function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify({ toplevel: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Image optimization task
async function img() {
  return gulp.src(paths.images.src)
    .pipe(imagemin().on('error', function (err) {
      console.error(err.message);
    }))
    .pipe(gulp.dest(paths.images.dest));
}

// Clean build directory
async function clean() {
  return deleteSync([paths.clean]);
}

// HTML task
async function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Watch task for live-reloading
async function watch() {
  browserSync.init({
    server: { baseDir: './build' },
    tunnel: false,
    port: 3200
  });

  gulp.watch('./src/scss/**/*.scss', styles);
  gulp.watch('./src/js/**/*.js', scripts);
  gulp.watch('./src/*.html', html);
  gulp.watch('./*.html').on('change', browserSync.reload);
}

// Gulp tasks
gulp.task('build', gulp.series(clean, gulp.parallel(html, styles, scripts, img)));
gulp.task('dev', gulp.series('build', watch));
