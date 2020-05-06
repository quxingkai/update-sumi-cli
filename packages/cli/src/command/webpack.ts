import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import execa from 'execa';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';

import parallelRunPromise from '../scripts/parallel-run-promise';
import getEntryWebpackConfig from '../scripts/webpack/webpack.config.entry';
import getBrowserWebpackConfig from '../scripts/webpack/webpack.config.browser';
import getWebpackNodeConfig from '../scripts/webpack/webpack.config.node';
import getWorkerWebpackConfig from '../scripts/webpack/webpack.config.worker';

// TODO: mode#production/development

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

type CompilerMethod = 'run' | 'watch';

module.exports = async function(compilerMethod: CompilerMethod) {
  const webpackTasks = webpackConfigs.map(webpackConfig => {
    return async () => {
      await runTask(webpackConfig, compilerMethod);
    };
  });

  await parallelRunPromise(webpackTasks, 1);
};

function runTask(webpackConfig: any, compilerMethod: CompilerMethod) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(compilerMethod === 'watch' ? Object.assign(webpackConfig, { devtool: 'inline-source-map' }) : webpackConfig);

    const callback = (err: Error, stats: any) => {
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
