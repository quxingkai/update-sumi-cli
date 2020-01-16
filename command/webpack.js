const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const parallelRunPromise = require('../lib/parallel-run-promise');
const getEntryWebpackConfig = require('../lib/webpack/webpack.config.entry');
const getBrowserWebpackConfig = require('../lib/webpack/webpack.config.browser');
const getWebpackNodeConfig = require('../lib/webpack/webpack.config.node');
const getWorkerWebpackConfig = require('../lib/webpack/webpack.config.worker');

const cwd = process.cwd();
const pkgContent = JSON.parse(
  fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'),
);

const webpackConfigs = [
  getBrowserWebpackConfig,
  getWebpackNodeConfig,
  getEntryWebpackConfig,
  getWorkerWebpackConfig,
]
  .map(fn => {
    const result = fn({ cwd, pkgContent });
    if (result) {
      return result.toConfig();
    }
  })
  .filter(n => n);

// webpackConfigs.push(getBrowserWebpackConfig({cwd, pkgContent}));

module.exports = async function(compilerMethod) {
  const promises = webpackConfigs.map(webpackConfig => {
    return async () => {
      await runTask(webpackConfig, compilerMethod);
    };
  });

  await parallelRunPromise(promises, 1);
};

function runTask(webpackConfig, compilerMethod) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);

    const callback = (err, stats) => {
      if (err) {
        console.error('WEBPACK', err.stack || err.toString());
        reject(err);
        return;
      }

      console.info(
        'WEBPACK',
        stats.toString({
          assets: true,
          colors: true,
          chunks: false,
          entrypoints: false,
          modules: false,
        }),
      );

      const json = stats.toJson({}, true);
      const messages = formatWebpackMessages(json);
      const isSuccessful = !messages.errors.length && !messages.warnings.length;

      if (isSuccessful) {
        // @ts-ignore
        if (stats.stats) {
          console.info('WEBPACK', 'Compiled successfully');
        } else {
          console.info(
            'WEBPACK',
            `Compiled successfully in ${(json.time / 1000).toFixed(1)}s!`,
          );
        }
      } else if (messages.errors.length) {
        console.log(messages.errors.join('\n\n'));
      } else if (messages.warnings.length) {
        console.warn('WEBPACK', 'Compiled with warnings.');
        console.log(messages.warnings.join('\n\n'));
      }

      resolve({ stats });
    };

    if (compilerMethod === 'run') {
      compiler.run(callback);
    }

    if (compilerMethod === 'watch') {
      compiler.watch({}, callback);
    }
  });
}
