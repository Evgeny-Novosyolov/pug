const gulp = require('gulp');
const concat = require('gulp-concat');
// const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const imagemin = require('gulp-imagemin');
const webpack = require('webpack-stream');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const changed = require('gulp-changed');

let watchPage = "test.html"

const cssFiles = [
  'src/styles/main.scss'

];
const htmlFiles = [
  'src/views/*.pug'

];

let webConfig = {
  output: {
    filename: 'all.js'
  },
  module: {
    rules: [
      {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: '/node_modules/'
    }
  ]
  }
};

function pugs() {
  return gulp.src(htmlFiles)
    .pipe(changed('build/'))
    .pipe(pug({pretty:true}))
    .pipe(gulp.dest('build/')) //выгрузим их в папку build
    .pipe(browserSync.reload({stream: true}))//И перезагрузим наш сервер для обновлений
}


function styles() {
  return gulp.src(cssFiles)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
}



function scripts() {
  return gulp.src('src/js/index.js')
    .pipe(webpack(webConfig))
    .on('error', function handleError() {
      this.emit('end'); // Recover from errors
    })

    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream());

}


function imgs() {
  return gulp.src('src/images/*.+(jpg|jpeg|png|gif)')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      interlaced: true
    }))
    .pipe(gulp.dest('build/images'));
}


function clean() {
  return del(['build/*']);
}




function watch() {
  browserSync.init({
    server: {
      baseDir: "build/",
      // directory: true,
      index: watchPage,
    },
    // port: 8080,
    // open: true,
    // notify: false,
    // tunnel: true
  });
  gulp.watch('src/**/*.pug', pugs);
  gulp.watch('src/**/*.css', styles);
  gulp.watch('src/**/*.scss', styles);
  gulp.watch('./build/**/*.html', styles);
 

  gulp.watch('src/images/*.+(jpg|jpeg|png|gif)', imgs);
  gulp.watch('src/**/*.js', scripts);

  gulp.watch("./src/**/*.pug").on('change', browserSync.reload);
  gulp.watch("./build/"+watchPage).on('change', browserSync.reload);
}


gulp.task('pugs', pugs);

gulp.task('styles', styles);

gulp.task('scripts', scripts);

gulp.task('imgs', imgs);

gulp.task('del', clean);

gulp.task('watch', watch);

let build = gulp.series(clean,
  gulp.parallel(pugs, styles, scripts, imgs));

gulp.task('build', build);

gulp.task('dev', gulp.series('build', 'watch'));