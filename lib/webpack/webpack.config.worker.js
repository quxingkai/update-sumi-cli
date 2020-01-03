const path = require('path')
const Config = require('webpack-chain');
const fs = require('fs')

const config = new Config();
const EXCLUDE_REGX = /node_modules/;

module.exports = (options = {}) => {
  const { cwd, pkgContent } = options;
  const extensionId = `${pkgContent.publisher}.${pkgContent.name}`
  const extensionUnderlineId = extensionId.replace(/\./g, '_').replace(/-/g, '_');

  config
  .entry('index')
    .add(path.join(cwd, 'src/extend/worker/index.ts'))
    .end()
  .output
    .path(path.join(cwd, 'out/extend/worker'))
    .filename('[name].js')
    .library(`kaitian_extend_browser_worker_${extensionUnderlineId}`)
    .libraryTarget('var')
    .end()
  .mode('production')
  .target('node').end();

  config.optimization.minimize(false);

  config.resolve.extensions
    .merge(['.js', 'ts']);

  config.module.rule('ts')
    .test(/\.tsx?$/)
      .exclude
        .add(EXCLUDE_REGX)
        .end()
      .use('ts-loader')
        .loader(require.resolve('ts-loader'))
        .options({ transpileOnly: true });

  config.externals({
    'vscode': 'vscode',
    'kaitian': `kaitian.${extensionUnderlineId}`,
  });

  return config;
}
