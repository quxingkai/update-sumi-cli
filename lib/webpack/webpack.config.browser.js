const path = require('path');
const fs = require('fs');
const Config = require('webpack-chain');
const getLoaderConfig = require('./webpack.config.loader');

const config = new Config();
const cwd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));

module.exports = () => {
  config
    .entry('index')
      .add(path.join(cwd, 'src/extend/browser/index.ts'))
      .end()
    .output
      .path(path.join(cwd, 'out/extend/browser'))
      .filename('[name].js')
      .library(`extend-browser-${pkg.name}`)
      .libraryTarget('umd')
      .end();
  
  config.resolve.extensions
    .merge([".ts", ".tsx", ".js"]);

  config.optimization.minimize(false);

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
  });

  getLoaderConfig(config);
  
  return config;
}