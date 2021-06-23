const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const webp = require('gulp-webp');
const fileinc = require('gulp-file-include');
const babel = require('gulp-babel');

let project_folder = "build";
let src_folder = "#src";
let {src, dest} = require('gulp');
let path = {
    src: {
        index: src_folder + "/index.html",
        pages: src_folder + '/html/pages/*.html',
        phpTemplates: src_folder + '/html/templates/*.html',

        css: src_folder + "/scss/style.scss",
        js: src_folder + "/js/**/*.js",
        libs: src_folder + "/libs/**/*",
        img: src_folder + "/img/**/*.{jpg,png,webp,ico,svg,gif}",
        fonts: src_folder + "/fonts/*.ttf",
    },
    build: {
        index: project_folder + "/",
        pages: project_folder + "/pages",
        phpTemplates: project_folder + "/php_tmp",

        css: project_folder + "/css",
        js: project_folder + "/js",
        libs: project_folder + "/libs",
        img: project_folder + "/img",
        fonts: project_folder + "/fonts",
    },
    watch: {
        html: src_folder + "/**/*.html",
        css: src_folder + "/scss/**/*.scss",
        js: src_folder + "/js/**/*.js",
        libs: src_folder + "/libs/**/*",
        img: src_folder + "/img/**/*.{jpg,png,webp,ico,svg,gif}",
        icons: src_folder + "/img/icons/*.svg",
        fonts: src_folder + "/fonts/*.ttf",
    },
    clean: "./" + project_folder + "/",
};

function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,

    })
}

function html() {
    src(path.src.pages)
        .pipe(fileinc({
            basepath: src_folder + '/html/templates/',
        }))
        .pipe(dest(path.build.pages));
    src(path.src.phpTemplates)
        .pipe(dest(path.build.phpTemplates));
    return src(path.src.index)
        .pipe(fileinc({
            basepath: src_folder + '/html/templates/',
        }))
        .pipe(dest(path.build.index))
        .pipe(browsersync.stream())
}

function style(params) {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded',
            })
        )
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true,
        }))

        .pipe(group_media())
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    src([path.src.js, "!" + src_folder + "/js/**/_*.js"])
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(path.build.js));
    return src(src_folder + "/js/**/_*.js")
        .pipe(concat('script.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function libs() {
    return src(path.src.libs)
        .pipe(dest(path.build.libs))
}

function images() {
    src(path.src.img)
        .pipe(dest(path.build.img));
    return src(path.src.img)
        .pipe(webp())
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

function sprite() {
    return src(src_folder + '/img/icons/*.svg')
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../icons/icons.svg",
                }
            }
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], style);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.fonts], fonts);
    gulp.watch([path.watch.libs], libs);
    gulp.watch([path.watch.icons], sprite);
}

function clean(params) {
    return del(path.clean);
}

gulp.task('otf2ttf', function name(params) {
    return src([src_folder + "/fonts/*.otf"])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(src_folder + '/fonts/'))
});

let build = gulp.series(clean, gulp.parallel(html, style, js, libs, images, sprite, fonts));
let watch = gulp.parallel(build, browserSync, watchFiles);

exports.default = watch;