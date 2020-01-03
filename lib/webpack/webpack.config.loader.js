const deepClone = require('lodash.clonedeep');

const URL_LOADER_LIMIT = 8192;
const EXCLUDE_REGX = /node_modules/;

// config css rules
const configCSSRule = (config, style, loaders = []) => {
  const cssModuleReg = new RegExp(`\\.module\\.${style}$`);
  const styleReg = new RegExp(`\\.${style}$`);
  const cssLoaderOpts = {
    sourceMap: true,
  };
  const cssModuleLoaderOpts = {
    ...cssLoaderOpts,
    modules: {
      localIdentName: '[folder]--[local]--[hash:base64:7]',
    },
  };

  // add both rule of css and css module
  ['css', 'module'].forEach((ruleKey) => {
    let rule;
    if (ruleKey === 'module') {
      rule = config.module.rule(`${style}-module`)
        .test(cssModuleReg);
    } else {
      rule = config.module.rule(style)
        .test(styleReg)
          .exclude.add(cssModuleReg).end();
    }

    rule
      .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options(ruleKey === 'module' ? cssModuleLoaderOpts : cssLoaderOpts)
        .end()

    loaders.forEach((loader) => {
      const [loaderName, loaderPath, loaderOpts = {}] = loader;
      rule.use(loaderName)
        .loader(loaderPath)
        .options({ ...cssLoaderOpts, ...loaderOpts });
    });
  });
};

const configAssetsRule = (config, type, testReg, loaderOpts = {}) => {
  config.module.rule(type).test(testReg).use(type)
    .loader(require.resolve('url-loader'))
    .options({
      name: 'assets/[hash].[ext]',
      limit: URL_LOADER_LIMIT,
      ...loaderOpts,
    });
};

module.exports = (config) => {
  // css loader
  [
    ['css'],
    ['scss', [['sass-loader', require.resolve('sass-loader')]]],
    ['less', [['less-loader', require.resolve('less-loader'), { javascriptEnabled: true }]]],
  ].forEach(([style, loaders]) => {
    configCSSRule(config, style, loaders || []);
  });

  [
    ['woff2', /\.woff2?$/, { mimetype: 'application/font-woff' }],
    ['ttf', /\.ttf$/, { mimetype: 'application/octet-stream' }],
    ['eot', /\.eot$/, { mimetype: 'application/vnd.ms-fontobject' }],
    ['svg', /\.svg$/, { mimetype: 'image/svg+xml' }],
    ['img', /\.(png|jpg|jpeg|gif)$/i],
  ].forEach(([type, reg, opts]) => {
    configAssetsRule(config, type, reg, opts || {});
  });

  // ts loader
  config.module.rule('tsx')
    .test(/\.tsx?$/)
    .exclude
      .add(/node_modules/)
      .end()
    .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options({
        transpileOnly: true,
        compilerOptions: {
          module: 'ES6',
        }
      });
};
