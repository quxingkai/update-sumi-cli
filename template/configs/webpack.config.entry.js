const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, '../src/extension.ts'),
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
  output: {
    filename: 'extension.js',
    path: path.join(__dirname, '../out'),
    libraryTarget: 'commonjs',
  },
  devtool: false,
  plugins: [
    new CopyWebpackPlugin([
      { from: '../out/**/*', to: '.', ignore: ['*.js', '*.js.map'], flatten: true }
    ])
  ],
};
