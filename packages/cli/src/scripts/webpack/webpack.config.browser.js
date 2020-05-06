const path = require('path');
const fs = require('fs');
const Config = require('webpack-chain');
const getLoaderConfig = require('./webpack.config.loader');

const config = new Config();

module.exports = (options = {}) => {
  const { cwd, pkgContent } = options;
  const browserEntryPath = path.join(cwd, 'src/extend/browser/index.ts');
  const browserOutPath = path.join(cwd, 'out/browser');

  if (!fs.existsSync(browserEntryPath)) {
    return null;
  }

  config
    .entry('index')
    .add(browserEntryPath)
    .end()
    .output.path(browserOutPath)
    .filename('[name].js')
    .library(`extend-browser-${pkgContent.name}`)
    .libraryTarget('umd')
    .end();

  config.resolve.extensions.merge(['.ts', '.tsx', '.js', '.json', '.less']);

  config.optimization.minimize(false);

  config.externals({
    react: 'React',
    'react-dom': 'ReactDOM',
    'kaitian-browser': 'kaitian-browser',
  });

  // webpack loaders
  getLoaderConfig(config);

  return config;
};
