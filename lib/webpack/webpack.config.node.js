const path = require('path');
const fs = require('fs');
const Config = require('webpack-chain');

const config = new Config();
const EXCLUDE_REGX = /node_modules/;

module.exports = (options = {}) => {
  const { cwd, pkgContent } = options;
  const nodeEntryPath = path.join(cwd, 'src/extend/node/index.ts');
  const nodeOutPath = path.join(cwd, 'out/node');

  if (!fs.existsSync(nodeEntryPath)) {
    return null;
  }

  config
    .entry('index')
      .add(nodeEntryPath)
      .end()
    .output
      .path(nodeOutPath)
      .filename('[name].js')
      .library(`extend-node-${pkgContent.name}`)
      .libraryTarget('commonjs2')
      .end()
    .mode('production')
    .target('node')
    .end();

  config.resolve.extensions
    .merge(['.js', 'ts']);

  config.optimization.minimize(false);

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
    'kaitian': 'kaitian',
  })

  return config;
};
