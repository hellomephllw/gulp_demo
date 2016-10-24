/**file paths*/
const filePaths = {
    //js common
    jsCommon: ['lib/sea.js', 'lib/jquery-1.12.4.min.js'],
    //js files
    jsFiles: [
        '*.js',
        'frontstage/**/*.js'
    ],
    //设置别名，可在js文件中直接通过别名获取该模块
    jsAlias: {
        jquery: 'lib/jquery-1.12.4.min',
        utilities: 'lib/utilities'
    },
    //在js文件中被require到，但该模块不会被打包进去，如jquery不被忽略的话，就会在该文件中打包一次，又在common中打包一次，形成重复
    jsIgnore: ['jquery'],
    //css files
    cssFiles: [
        '*.scss',
        'frontstage/**/*.scss'
    ]
};

/**basic paths*/
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

export {paths, filePaths};