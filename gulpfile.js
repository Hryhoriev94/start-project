const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const nunjucksRender = require('gulp-nunjucks-render');
const prefix = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack-stream');
const content = require('./content.js');

const SOURCE_TEMPLATES_PATH = './src/**/*.njk';
const DIST_TEMPLATES_PATH = './dist';
const SOURCE_STYLES_PATH = './src/assets/styles/*.scss';
const DIST_STYLES_PATH = './dist/assets/styles';
const SOURCE_SCRIPTS_PATH = './src/assets/scripts/**/*.ts';
const DIST_SCRIPTS_PATH = './dist/assets/scripts';
function serve() {
    browserSync.init({
        server: DIST_TEMPLATES_PATH
    });

    gulp.watch(SOURCE_STYLES_PATH, gulp.series('sass'));
    gulp.watch(SOURCE_SCRIPTS_PATH, gulp.series('webpack'));
    gulp.watch(SOURCE_TEMPLATES_PATH, gulp.series('nunjucks'));
    gulp.watch("./dist/*.html").on('change', browserSync.reload);
}

function compileSass() {
    return gulp.src(SOURCE_STYLES_PATH)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefix('last 2 versions'))
        .pipe(csso({ sourceMap: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_STYLES_PATH))
        .pipe(browserSync.stream());
}

function nunjucks() {
    return gulp
        .src(SOURCE_TEMPLATES_PATH)
        .pipe(
            nunjucksRender({
                path: [SOURCE_TEMPLATES_PATH],
                data: content,
            })
        )
        .pipe(gulp.dest(DIST_TEMPLATES_PATH))
        .pipe(browserSync.stream());
}

function webpackBuild() {
    return gulp.src(SOURCE_SCRIPTS_PATH)
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest(DIST_SCRIPTS_PATH))
        .pipe(browserSync.stream());
}

gulp.task('serve', serve);
gulp.task('sass', compileSass);
gulp.task('nunjucks', nunjucks);
gulp.task('webpack', webpackBuild)
gulp.task('default', gulp.series('sass', 'nunjucks', 'webpack', 'serve'));
