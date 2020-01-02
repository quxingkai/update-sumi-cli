const path = require('path');
const fs = require('fs');
const Config = require('webpack-chain');

const config = new Config();
const cwd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
const EXCLUDE_REGX = /node_modules/;

module.exports = () => {
  config
    .entry('index')
      .add(path.join(cwd, 'src/extend/node/index.ts'))
      .end()
    .output
      .path(path.join(cwd, 'out/extend/node'))
      .filename('[name].js')
      .library(`extend-node-${pkg.name}`)
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
