const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cwd = process.cwd();

module.exports = {
  entry: path.join(cwd, 'src/extension.ts'),
  output: {
    filename: 'extension.js',
    path: path.join(cwd, 'out'),
    libraryTarget: 'commonjs'
  },
  mode: 'none',
  target: 'node',
  node: {
    __dirname: false
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              'sourceMap': true,
            }
          }
        }
      ]
    }]
  },
  externals: {
    'vscode': 'commonjs vscode',
    'kaitian': 'commonjs kaitian',
  },
  devtool: false,
};
