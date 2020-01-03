const path = require('path');
const Config = require('webpack-chain');
const getLoaderConfig = require('./webpack.config.loader');

const config = new Config();
const cwd = process.cwd();

module.exports = () => {
  config
    .entry('extension')
      .add(path.join(cwd, 'src/extension.ts'))
      .end()
    .output
      .path(path.join(cwd, 'out'))
      .filename('[name].js')
      .libraryTarget('commonjs')
      .end()
    .mode('none')
    .target('node').end();

  config.resolve.extensions
    .merge(['.js', 'ts']);

  config.externals({
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
    },
    'vscode': 'commonjs vscode',
    'kaitian': 'commonjs kaitian',
  })

  getLoaderConfig(config);

  return config;
};
