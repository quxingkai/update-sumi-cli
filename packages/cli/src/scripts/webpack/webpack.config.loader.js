const URL_LOADER_LIMIT = 8192;

const configAssetsRule = (config, type, testReg, loaderOpts = {}) => {
  config.module
    .rule(type)
    .test(testReg)
    .use(type)
    .loader(require.resolve('url-loader'))
    .options({
      name: 'assets/[hash].[ext]',
      limit: URL_LOADER_LIMIT,
      ...loaderOpts,
    });
};

module.exports = config => {
  const cssRule = config.module.rule('css').test(/\.css$/);
  cssRule
    .use('style-loader')
    .loader(require.resolve('style-loader'))
    .end()
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .end();

  const lessRule = config.module.rule('less').test(/^((?!\.module).)*less$/);
  lessRule
    .use('style-loader')
    .loader(require.resolve('style-loader'))
    .end()
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .end()
    .use('less-loader')
    .loader(require.resolve('less-loader'))
    .options({ javascriptEnabled: true })
    .end();

  const cssModuleRule = config.module
    .rule('less.module')
    .test(/\.module.less$/);
  cssModuleRule
    .use('style-loader')
    .loader(require.resolve('style-loader'))
    .end()
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options({
      sourceMap: false,
      modules: {
        localIdentName: '[local]___[hash:base64:5]',
      },
    })
    .end()
    .use('less-loader')
    .loader(require.resolve('less-loader'))
    .options({ javascriptEnabled: true })
    .end();

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
  config.module
    .rule('tsx')
    .test(/\.tsx?$/)
    .exclude.add(/node_modules/)
    .end()
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({
      transpileOnly: true,
      compilerOptions: {
        module: 'ES6',
      },
    });
};
