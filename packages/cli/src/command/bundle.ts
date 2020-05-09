import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import webpack from 'webpack';
import execa from 'execa';
import { Command } from 'clipanion';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';

import parallelRunPromise from '../scripts/parallel-run-promise';
import getEntryWebpackConfig from '../scripts/webpack/webpack.config.entry';
import getBrowserWebpackConfig from '../scripts/webpack/webpack.config.browser';
import getWebpackNodeConfig from '../scripts/webpack/webpack.config.node';
import getWorkerWebpackConfig from '../scripts/webpack/webpack.config.worker';

// TODO: mode#production/development
const cwd = process.cwd();

async function getPkgContent() {
  const json = await promisify(fs.readFile)(path.join(cwd, 'package.json'), 'utf-8');
  return JSON.parse(json);
}

async function getWebpackConfigs() {
  const pkgContent = await getPkgContent();
  return [
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
}
// webpackConfigs.push(getBrowserWebpackConfig({cwd, pkgContent}));

type CompilerMethod = 'run' | 'watch';

async function bundle(compilerMethod: CompilerMethod) {
  const webpackConfigs = await getWebpackConfigs();
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

export class WatchCommand extends Command {
  static usage = Command.Usage({
    description: 'watch extension in development mode',
    examples: [
      [
        'Run watch mode when developing a kaitian extension project',
        'kaitian watch',
      ],
    ],
  });

  @Command.Path('watch')
  async execute() {
    try {
      await bundle('watch');
    } catch (err) {
      console.error('kaitian watch error:', err);
      process.exit(1);
    }
  }
}

export class CompileCommand extends Command {
  static usage = Command.Usage({
    description: 'compile extension in production mode',
    examples: [
      [
        'Compile code when developing a kaitian extension project',
        'kaitian compile',
      ],
    ],
  });

  @Command.Path('compile')
  async execute() {
    try {
      await bundle('run');
    } catch (err) {
      console.error('kaitian watch error:', err);
      process.exit(1);
    }
  }
}
