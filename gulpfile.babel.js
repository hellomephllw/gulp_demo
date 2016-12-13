'use strict';
global.rootPath = __dirname;
import gulp from 'gulp';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import del from 'del';
import runSequence from 'run-sequence';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import fs from 'fs';
import through from 'through2';
let cmdMulti = require(`${rootPath}/src/js/lib/gulp-cmd-multi`),
    md5 = require(`${rootPath}/src/js/lib/md5`),
    {paths, filePaths, coreConfig} = require(`${rootPath}/src/js/lib/gulpfile.config`);

/**dispose css*/
//css
gulp.task('css', () => {
    //决定是否压缩css
    let outputStyle = Boolean(coreConfig['cssCompress']) ? 'compressed' : undefined;

    gulp.src(filePaths.cssFiles.map(filePath => `${paths.cssSrc}/${filePath}`))
        //编译css代码
        .pipe(sass({
            //压缩css
            outputStyle: outputStyle
        }))
        .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%']}))
        .pipe(rev())
        .pipe(gulp.dest(paths.cssAssets))
        .pipe(rev.manifest())
        .pipe(gulp.dest(`${paths.cssAssets}/${paths.resources}`))
});
//clean
gulp.task('cssClean', () => del([`${paths.cssAssets}/**/*.css`, `${paths.cssAssets}/${paths.resources}/*.json`]));

/**dispose images*/
//imgs
gulp.task('imgs', () =>
    gulp.src(`${paths.imgsSrc}/**`)
        .pipe(gulp.dest(`${paths.imgsAssets}`))
);

/**dispose fonts*/
//fonts
gulp.task('fonts', () =>
    gulp.src(`${paths.fontsSrc}/**`)
        .pipe(gulp.dest(`${paths.fontsAssets}`))
);

/**dispose scripts*/
//js
gulp.task('js', () => {
    //决定是否压缩js
    let jsCompress = Boolean(coreConfig['jsCompress']) ? uglify : () => through.obj((file, enc, cb) => cb(null, file));

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
        .pipe(jsCompress())
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
gulp.task('jsClean', () => del([`${paths.jsAssets}/**/*(*.js|*.map)`, `${paths.jsAssets}/${paths.resources}/*.json`]));

/**dispose views*/
//revReplace
gulp.task('revReplace', () => {
    //执行替换
    executeVersionReplace();
});
//manifest内容缓存
let prevJsContent = '',
    prevCssContent = '';
//revReplace for watch
gulp.task('revReplaceForWatch', () => {
    //manifest文件路径
    const
        jsRevManifestPath = `${paths.jsAssets}/${paths.resources}/rev-manifest.json`,
        cssRevManifestPath = `${paths.cssAssets}/${paths.resources}/rev-manifest.json`;

    //开启对js文件改动的监听
    fs.watchFile(jsRevManifestPath, {interval: 300}, (curr, prev) => {
        //文件被删除或新增时忽略
        if (curr.mtime.getTime() === 0) return ;
        //文件没有发生改动时忽略
        if (curr.mtime.getTime() - prev.mtime.getTime() === 0) return ;

        //读取文件内容
        let data = fs.readFileSync(jsRevManifestPath, 'utf8');

        //读取的文件数据为空时忽略
        if (data === '') return ;
        //文件内容没有发生改变时忽略
        if (md5(data) === md5(prevJsContent)) return ;

        //执行替换
        executeVersionReplace();
        //存储改变后的内容
        prevJsContent = data;
    });
    //开启对css文件改动的监听
    fs.watchFile(cssRevManifestPath, {interval: 300}, (curr, prev) => {
        //文件被删除或新增时忽略
        if (curr.mtime.getTime() === 0) return ;
        //文件没有发生改动时忽略
        if (curr.mtime.getTime() - prev.mtime.getTime() === 0) return ;

        //读取文件内容
        let data = fs.readFileSync(cssRevManifestPath, 'utf8');

        //读取的文件数据为空时忽略
        if (data === '') return ;
        //文件内容没有发生改变时忽略
        if (md5(data) === md5(prevCssContent)) return ;

        //执行替换
        executeVersionReplace();
        //存储改变后的内容
        prevCssContent = data;
    });
});
//执行页面的版本替换
function executeVersionReplace() {
    //读取rev-manifest.json
    let manifest = gulp.src([
        `${paths.jsAssets}/${paths.resources}/rev-manifest.json`,
        `${paths.cssAssets}/${paths.resources}/rev-manifest.json`
    ]);

    gulp.src(`${paths.viewsSrc}/source/**/*.html`)
        //根据rev-manifest.json替换文件名
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(paths.viewsAssets))
        //进行browserSync重载
        .pipe(browserSync.reload({stream: true}));

    console.log('compile views...');
}

/**default*/
gulp.task('default', ['cssClean', 'jsClean'], () => {
    //第一次启动gulp需要执行的任务
    let runArr = [];
    if (Boolean(coreConfig['moveFonts'])) runArr.push('fonts');
    if (Boolean(coreConfig['moveImgs'])) runArr.push('imgs');
    if (Boolean(coreConfig['compileCss'])) runArr.push('css');
    if (Boolean(coreConfig['compileJs'])) runArr.push('js');

    //启动静态服务器
    if (Boolean(coreConfig['browserSync'])) launchWebServer();

    //执行
    runSequence('revReplaceForWatch', runArr);
    //强制编译views
    if (Boolean(coreConfig['compileViewsForce'])) executeVersionReplace();

    //监听
    gulp.watch(`${paths.cssSrc}/**/*.scss`, () => runSequence('cssClean', 'css'));
    gulp.watch(`${paths.jsSrc}/**/*.js`, () => runSequence('jsClean', 'js'));
    gulp.watch(`${paths.viewsSrc}/**/*.html`, () => runSequence('revReplace'));
});
//启动服务器
function launchWebServer() {
    coreConfig.serverType === 'static' ? browserSync.init(coreConfig.staticServer) : browserSync.init(coreConfig.dynamicServer);
}