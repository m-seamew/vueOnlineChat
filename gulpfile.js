const gulp = require('gulp');
const sass = require('gulp-sass');
//const concat = require('gulp-concat');

const browserSync = require('browser-sync').create();
const prefix = require('gulp-autoprefixer');
const rigger = require('gulp-rigger');
const imagemin = require('gulp-imagemin');
const cleanCSS = require('gulp-clean-css');
const stripCssComments = require('gulp-strip-css-comments');

//CSS
const scssPath = './app/sass/main.scss';
const scssAllFilesPath = './app/sass/**/*';
const cssPath = './build/css';

//Background
const bgrInputPath = './build/css/bg/*';
const bgrOutputPath = './build/css/bg/';

//JS
const jsMainPath = './app/js/main.js';
const jsInput = './app/js/js-site/*.js';
const jsPath = './build/js';

//HTML
const htmlMainPath = './app/html/*.html';
const htmlInput = './app/html/**/*.html';
const htmlPath = './';

//background function
function prod() {
    return gulp.src([
        bgrInputPath
    ])
        .pipe(imagemin(
            {progressive: true}
        ))
        .pipe(gulp.dest(bgrOutputPath));
}

//css function
function style() {
    return gulp.src(scssPath)
        .pipe(sass())
        .pipe(prefix('last 2 versions'))
        // .pipe(sass({outputStyle: 'compressed'}))
        .pipe(cleanCSS({level: 2}))
        .pipe(stripCssComments(
            {preserve: false}
        ))
        .pipe(gulp.dest(cssPath))
        .pipe(sass().on('error', sass.logError))
        .pipe(browserSync.stream());

}


/*
//concat function
function ConcatJS() {
        return gulp.src(jsMainPath)
          .pipe(concat('app.min.js'))
          .pipe(gulp.dest(jsPath));
}*/

//Js function
function riggerJS() {
    return gulp.src(jsMainPath)
    .pipe(rigger())
    .pipe(gulp.dest('./build/js'))
}


//Html function
function riggerHTML() {
    return gulp.src(htmlMainPath)
    .pipe(rigger())
    .pipe(gulp.dest(htmlPath))
}


//watch function
function watch() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
    gulp.watch(scssAllFilesPath, style);
    gulp.watch('./*.html').on('change', browserSync.reload);
    gulp.watch(jsInput, riggerJS);
    gulp.watch(jsMainPath, riggerJS);
    gulp.watch(htmlInput, riggerHTML);
 //   gulp.watch(jsMainPath, ConcatJS);
}


exports.style = style;
exports.prod = prod;
exports.watch = watch;


