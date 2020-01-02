const path = require('path');
const fse = require('fs-extra');
const chalk = require('chalk');
const webpack = require("webpack");
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const parallelRunPromise = require('../lib/parallel-run-promise');
const webpackEntryConfig = require('../lib/webpack/webpack.config.entry');
const webpackBrowserConfig = require('../lib/webpack/webpack.config.browser');
const webpackNodeConfig = require('../lib/webpack/webpack.config.node');
const webpackWorkerConfig = require('../lib/webpack/webpack.config.worker');

const webpackConfigs = [
  webpackEntryConfig,
  webpackBrowserConfig,
  webpackNodeConfig,
  webpackWorkerConfig
]

module.exports = async function() {
  const promises = webpackConfigs.map(webpackConfig => {
    return async () => {
      await runTask(webpackConfig);
    }
  })

  await parallelRunPromise(promises, 1);
};

function runTask(webpackConfig) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error('WEBPACK', (err.stack || err.toString()))
        reject(err)
        return
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
      )

      const json = stats.toJson({}, true)
      const messages = formatWebpackMessages(json)
      const isSuccessful = !messages.errors.length && !messages.warnings.length

      if (isSuccessful) {
        // @ts-ignore
        if (stats.stats) {
          console.info('WEBPACK', 'Compiled successfully')
        } else {
          console.info(
            'WEBPACK',
            `Compiled successfully in ${(json.time / 1000).toFixed(1)}s!`
          )
        }
      } else if (messages.errors.length) {
        console.log(messages.errors.join('\n\n'))
      } else if (messages.warnings.length) {
        console.warn('WEBPACK', 'Compiled with warnings.')
        console.log(messages.warnings.join('\n\n'))
      }

      resolve({ stats })
    })
  })
}
