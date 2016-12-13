import fs from 'fs';

const
    //配置文件路径
    configPath = `${rootPath}/src/config`,
    //文件名
    filenames = {
        jsFiles: 'js.files.properties',
        jsCommon: 'js.common.properties',
        jsAlia: 'js.alias.properties',
        jsIgnore: 'js.ignore.properties',
        cssFiles: 'css.files.properties',
        basePaths: 'base.paths.properties',
        coreConfigPaths: 'base.core.properties'
    },
    //初始化文件路径
    filePaths = initFilePaths(),
    //初始化基础文档路径
    paths = initBasePath(),
    //初始化核心配置
    coreConfig = initCoreConfig();

/**file paths*/
//初始化文件路径
function initFilePaths() {
    let filePaths = {};

    filePaths.jsCommon = initJsCommonPaths();
    filePaths.jsFiles = initScriptFilePaths();
    filePaths.jsAlias = initJsAliaPaths();
    filePaths.jsIgnore = initJsIgnoreAlias();
    filePaths.cssFiles = initCssFilePath();

    return filePaths;
}

//初始化js脚本路径
function initScriptFilePaths() {

    return getSingleLineValues(`${configPath}/${filenames.jsFiles}`);
}

//初始化js别名路径
function initJsAliaPaths() {
    let alias = getProperties(`${configPath}/${filenames.jsAlia}`);

    return alias;
}

//初始化common中的js文件路径
function initJsCommonPaths() {

    return getSingleLineValues(`${configPath}/${filenames.jsCommon}`);
}

//初始化忽视别名
function initJsIgnoreAlias() {

    return getSingleLineValues(`${configPath}/${filenames.jsIgnore}`)
}

//初始化css文件路径
function initCssFilePath() {

    return getSingleLineValues(`${configPath}/${filenames.cssFiles}`);
}

/**server config*/
function initCoreConfig() {
    let properties = getProperties(`${configPath}/${filenames.coreConfigPaths}`),
        coreConfig = {
            //static or dynamic
            serverType: 'static',
            //static config
            staticServer: {
                server: {
                    baseDir: rootPath
                }
            },
            //dynamic config
            dynamicServer: {
                proxy: 'localhost:8000'
            }
        };

    if (properties['serverType']) coreConfig.serverType = properties['serverType'];
    if (properties['baseDir']) coreConfig.staticServer.server.baseDir = rootPath + properties['baseDir'];
    if (properties['proxy']) coreConfig.dynamicServer.proxy = properties['proxy'];
    if (Boolean(properties['browserSync'])) coreConfig.browserSync = true;


    return coreConfig;
}

/**basic paths*/
function initBasePath() {
    let paths = getProperties(`${configPath}/${filenames.basePaths}`);

    return paths;
}

/**utilities*/
function getProperties(path) {
    let content = fs.readFileSync(path, 'utf8'),
        lineBreak = '',
        properties = {};

    //因不同操作系统可能在换行上出现差异
    if (content.indexOf('\r\n') !== -1) lineBreak = '\r\n';
    else if (content.indexOf('\n') !== -1) lineBreak = '\n';
    else if (content.indexOf('\r') !== -1) lineBreak = '\r';

    //按换行拆分
    let propertiesContent = content.split(lineBreak);

    //去除注释和空行
    propertiesContent = propertiesContent.filter(str => str.slice(0, 1) !== '#' && str.trim() !== '');

    propertiesContent.map(ele => {
        let props = ele.trim().split('='),
            key = props[0].trim(),
            val = props[1].trim();

        properties[key] = val;
    });

    return properties;
}

function getSingleLineValues(path) {
    let content = fs.readFileSync(path, 'utf8'),
        lineBreak = '',
        paths = '';

    //因不同操作系统可能在换行上出现差异
    if (content.indexOf('\r\n') !== -1) lineBreak = '\r\n';
    else if (content.indexOf('\n') !== -1) lineBreak = '\n';
    else if (content.indexOf('\r') !== -1) lineBreak = '\r';

    //按换行拆分
    paths = content.split(lineBreak);

    //去除注释和空行
    paths = paths.filter(str => str.slice(0, 1) !== '#' && str.trim() !== '');

    //去除多余空白
    paths = paths.map(path => path.trim());

    return paths;
}

export {paths, filePaths, coreConfig};