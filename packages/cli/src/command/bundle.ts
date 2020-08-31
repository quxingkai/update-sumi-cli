import { Command } from 'clipanion';
import webpack from 'webpack';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as cp from 'child_process';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';

import parallelRunPromise from '../scripts/parallel-run-promise';


import { createNodeDefaults, createBrowserDefaults, createWorkerDefaults } from '../scripts/webpack/createWebpackConfig';


// TODO: mode#production/development
async function getWebpackConfigs() {
  const context = path.join(process.cwd());
  const browserEntry = path.join(context, 'src/extend/browser/index.ts');
  const nodeEntry = path.join(context, 'src/extend/node/index.ts');
  const vscodeEntry = path.join(context, 'src/extension.ts');
  const workerEntry = path.join(context, 'src/extend/worker/index.ts');

  return [
    fs.pathExistsSync(browserEntry) && createBrowserDefaults({ extensionDir: context, entry: {
      'extension-browser': browserEntry
    } }),
    fs.pathExistsSync(nodeEntry) && createNodeDefaults({
      extensionDir: context,
      entry: {
        'index': nodeEntry,
      },
      output: {
        filename: '[name].js',
        path: path.join(context, 'out', 'node'),
        libraryTarget: 'commonjs',
      },
    }),
    fs.pathExistsSync(vscodeEntry) && createNodeDefaults({
      extensionDir: context,
      entry: {
        'extension': vscodeEntry,
      }
    }),
    fs.pathExistsSync(workerEntry) && createWorkerDefaults({
      extensionDir: context,
      entry: {
        'extension-worker': workerEntry,
      }
    })
  ]
    .filter(n => n);
}

type CompilerMethod = 'run' | 'watch';

type RunTaskOptions = {
  onSuccess: () => void;
}

async function bundle(compilerMethod: CompilerMethod, options?: RunTaskOptions) {
  const webpackConfigs = await getWebpackConfigs();
  const webpackTasks = webpackConfigs.map(webpackConfig => {
    return async () => {
      await runTask(webpackConfig, compilerMethod, options);
    };
  });

  await parallelRunPromise(webpackTasks, 1);
}

function runTask(webpackConfig: any, compilerMethod: CompilerMethod, options?: RunTaskOptions) {
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
        options && options.onSuccess();
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

  @Command.String('--onSuccess')
  public onSuccessShell?: string;

  @Command.Path('watch')
  async execute() {
    try {
      await bundle('watch', { onSuccess: () => this.onSuccessShell && cp.exec(this.onSuccessShell) });
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
