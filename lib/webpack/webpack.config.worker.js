const path = require('path')
const Config = require('webpack-chain');
const fs = require('fs')

const config = new Config();
const EXCLUDE_REGX = /node_modules/;

module.exports = (options = {}) => {
  const { cwd, pkgContent } = options;
  const extensionId = `${pkgContent.publisher}.${pkgContent.name}`
  const extensionUnderlineId = extensionId.replace(/\./g, '_').replace(/-/g, '_');
  const workerEntryPath = path.join(cwd, 'src/extend/worker/index.ts');
  const workerOutPath = path.join(cwd, 'out/worker');

  console.log(111);
  console.log(fs.existsSync(workerEntryPath));
  console.log(222);

  if (!fs.existsSync(workerEntryPath)) {
    return null;
  }

  config
    .entry('index')
      .add(workerEntryPath)
      .end()
    .output
      .path(workerOutPath)
      .filename('[name].js')
      .library(`kaitian_extend_browser_worker_${extensionUnderlineId}`)
      .libraryTarget('var')
      .end()
    .mode('production')
    .target('node').end();

  config.optimization.minimize(false);

  config.resolve.extensions
    .merge(['.js', 'ts']);

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
    'kaitian': `kaitian.${extensionUnderlineId}`,
  });

  return config;
}
