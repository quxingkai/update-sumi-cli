const path = require('path');
const fs = require('fs');
const Config = require('webpack-chain');
const getLoaderConfig = require('./webpack.config.loader');

const config = new Config();

module.exports = (options = {}) => {
  const { cwd, pkgContent } = options;
  const browserEntryPath = path.join(cwd, 'src/extend/browser/index.ts');
  const browserOutPath = path.join(cwd, 'out/browser');

  if (!fs.existsSync) {
    return null;
  }

  config
    .entry('index')
      .add(browserEntryPath)
      .end()
    .output
      .path(browserOutPath)
      .filename('[name].js')
      .library(`extend-browser-${pkgContent.name}`)
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
    }
  });

  getLoaderConfig(config);
  
  return config;
}