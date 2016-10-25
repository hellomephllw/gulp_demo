'use strict';
import {paths, filePaths, webServer} from './gulpfile.config';
import gulp from 'gulp';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import del from 'del';
import runSequence from 'run-sequence';
import cmdMulti from './src/js/lib/gulp-cmd-multi';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import fs from 'fs';

/**dispose css*/
//css
gulp.task('css', () =>
    gulp.src(filePaths.cssFiles.map(filePath => `${paths.cssSrc}/${filePath}`))
        //编译css代码
        .pipe(sass({
            //压缩css
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%']}))
        .pipe(rev())
        .pipe(gulp.dest(paths.cssAssets))
        .pipe(rev.manifest())
        .pipe(gulp.dest(`${paths.cssAssets}/${paths.resources}`))
);
//clean
gulp.task('cssClean', () => del(`${paths.cssAssets}/**/*.css`));

/**dispose images*/
//imgs
gulp.task('imgs', () =>
    gulp.src(`${paths.imgsSrc}/*`)
        .pipe(gulp.dest(`${paths.imgsAssets}`))
);

/**dispose fonts*/
//fonts

/**dispose scripts*/
//js
gulp.task('js', () => {
    //common
    gulp.src(filePaths.jsCommon.map(filename => `${paths.jsSrc}/${filename}`))
        .pipe(concat('common.js'))
        .pipe(gulp.dest(`${paths.jsAssets}`));

    //special
    gulp.src(filePaths.jsFiles.map(filePath => `${paths.jsSrc}/${filePath}`))
        .pipe(cmdMulti({
            //入口模块id
            mainId: 'entry',
            //基础路径
            base: paths.jsSrc,
            //依赖包的快捷访问别名
            alias: filePaths.jsAlias,
            //不将jq打入包
            ignore: filePaths.jsIgnore
        }))
        .pipe(sourcemaps.init())
        //压缩
        // .pipe(uglify())
        //hashcode
        .pipe(rev())
        //source map
        .pipe(sourcemaps.write(paths.resources))
        //输出
        .pipe(gulp.dest(`${paths.jsAssets}`))
        //生成rev-manifest.json
        .pipe(rev.manifest())
        //输出rev-manifest.json
        .pipe(gulp.dest(`${paths.jsAssets}/${paths.resources}`));
});
//clean
gulp.task('jsClean', () => del(`${paths.jsAssets}/**/*(*.js|*.map)`));

/**dispose views*/
//revReplace
gulp.task('revReplace', () => {
    //执行替换
    executeVersionReplace();
});
//revReplace for watch
gulp.task('revReplaceForWatch', () => {
    //开启监听
    let jsWatcher = fs.watch(`${paths.jsAssets}/${paths.resources}/rev-manifest.json`),
        cssWatcher = fs.watch(`${paths.cssAssets}/${paths.resources}/rev-manifest.json`);

    //manifest文件改动handler
    jsWatcher.on('change', () => {
        //关闭监听
        jsWatcher.close();
        cssWatcher.close();
        //执行替换
        executeVersionReplace();
    });
    cssWatcher.on('change', () => {
        //关闭监听
        jsWatcher.close();
        cssWatcher.close();
        //执行替换
        executeVersionReplace();
    });
});
//执行页面的版本替换
function executeVersionReplace() {
    //读取rev-manifest.json
    let manifest = gulp.src([
        `${paths.jsAssets}/${paths.resources}/rev-manifest.json`,
        `${paths.cssAssets}/${paths.resources}/rev-manifest.json`
    ]);

    gulp.src(`${paths.viewsSrc}/*.html`)
        //根据rev-manifest.json替换文件名
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(paths.viewsAssets))
        //进行browserSync重载
        .pipe(browserSync.reload({stream: true}));
}

/**default*/
gulp.task('default', ['cssClean', 'jsClean'], () => {
    //启动静态服务器
    launchWebServer();

    //执行
    runSequence(['imgs', 'css', 'js'], ['revReplace']);

    //监听
    gulp.watch(`${paths.cssSrc}/**/*.scss`, () => runSequence('revReplaceForWatch', 'cssClean', 'css'));
    gulp.watch(`${paths.viewsSrc}/**/*.html`, () => runSequence('revReplace'));
    gulp.watch(`${paths.jsSrc}/**/*.js`, () => runSequence('revReplaceForWatch', 'jsClean', 'js'));
});
//启动服务器
function launchWebServer() {
    webServer.type === 'static' ? browserSync.init(webServer.static) : browserSync.init(webServer.dynamic);
}