'use strict';
import gulp from 'gulp';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import sass from 'gulp-sass';
import del from 'del';
import runSequence from 'run-sequence';
import cmdPack from 'gulp-cmd-pack';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import fs from 'fs';

//paths
const paths = {
    src: 'src',
    assets: 'assets',
    resources: 'resources',
    viewsSrc: 'src/views',
    viewsAssets: 'assets/views',
    cssSrc: 'src/css',
    cssAssets: 'assets/css',
    imgsSrc: 'src/imgs',
    imgsAssets: 'assets/imgs',
    jsSrc: 'src/js',
    jsAssets: 'assets/js'
};

/**dispose css*/
//css
gulp.task('css', () =>
    gulp.src(`${paths.cssSrc}/*.scss`)
        //编译css代码
        .pipe(sass({
            //压缩css
            outputStyle: 'compressed'
        }))
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
    gulp.src([`${paths.jsSrc}/lib/sea.js`, `${paths.jsSrc}/lib/jquery-1.12.4.min.js`])
        .pipe(concat('common.js'))
        .pipe(gulp.dest(`${paths.jsAssets}`));

    //special
    gulp.src(`${paths.jsSrc}/*.js`)
        .pipe(cmdPack({
            //入口模块id
            mainId: 'app',
            //基础路径
            base: paths.jsSrc,
            //依赖包的快捷访问别名
            alias: {
                jquery: 'lib/jquery-1.12.4.min',
                utilities: 'lib/utilities'
            },
            //不将jq打入包
            ignore: ['jquery']
        }))
        .pipe(sourcemaps.init())
        //压缩
        .pipe(uglify())
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
        .pipe(gulp.dest(paths.viewsAssets));
}

/**default*/
gulp.task('default', ['cssClean', 'jsClean'], () => {
    //执行
    runSequence(['imgs', 'css', 'js'], ['revReplace']);

    //监听
    gulp.watch(`${paths.cssSrc}/**/*.scss`, () => runSequence('revReplaceForWatch', 'cssClean', 'css'));
    gulp.watch(`${paths.viewsSrc}/**/*.html`, () => runSequence('revReplace'));
    gulp.watch(`${paths.jsSrc}/**/*.js`, () => runSequence('revReplaceForWatch', 'jsClean', 'js'));
});