const fs = require('fs');
const path = require('path');
const Config = require('webpack-chain');

const config = new Config();

module.exports = (options = {}) => {
  const { cwd, pkgContent } = options;
  const tsConfigPath = path.join(cwd, 'tsconfig.json');
  const entryPath = path.join(cwd, 'src/extension.ts');
  const outPath = path.join(cwd, 'out');

  if (!fs.existsSync(entryPath)) {
    return null;
  }

  config
    .entry('extension')
    .add(entryPath)
    .end()
    .output.path(outPath)
    .filename('[name].js')
    .libraryTarget('commonjs')
    .end()
    .mode('none')
    .target('node')
    .end();

  config.resolve.extensions.merge(['.js', '.ts']);

  config.module
    .rule('ts')
    .test(/\.tsx?$/)
    .exclude.add(/node_modules/)
    .end()
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({ configFile: tsConfigPath });

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
    vscode: 'commonjs vscode',
    kaitian: 'commonjs kaitian',
  });

  return config;
};
