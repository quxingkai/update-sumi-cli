const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const darkTheme = require('@ant-design/dark-theme');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

const tsConfigPath = path.join(__dirname, './tsconfig.json');
const dir = path.join(__dirname, '../packages/browser');
const distDir = path.join(__dirname, '../scripts/browser');
const port = 8080;

module.exports = {
  entry: `${dir}/index.ts`,
  node: {
    net: 'empty',
    'child_process': 'empty',
    path: 'empty',
    url: false,
    fs: 'empty',
    process: 'mock',
  },
  output: {
    filename: 'browser.js',
    path: distDir,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
  },
  bail: true,
  mode: 'development',
  devtool: 'null',
  module: {
    // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
    exprContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              transpileOnly: true,
              configFile: tsConfigPath,
              compilerOptions: {
                target: 'es2015',
              },
            },
          },
        ],
      },
      {
        test: /\.png$/,
        use: 'file-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.module.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
            },
          },
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /^((?!\.module).)*less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
              modifyVars: darkTheme.default,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
              publicPath:
                'https://dev.g.alicdn.com/tao-ide/ide-core/0.0.1/fonts', // "http://localhost:8080/fonts"
            },
          },
        ],
      },
    ],
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
    moduleExtensions: ['-loader'],
  },
  optimization: {
    nodeEnv: process.env.NODE_ENV,
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, '../packages/browser/index.html'),
    // }),
    new AssetsPlugin({
      path: distDir,
      filename: 'assets.json',
      prettyPrint: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
    new CopyPlugin([
      { from: path.join(dir, 'vendor'), to: distDir },
      { from: path.join(dir, 'index.html'), to: distDir },
    ]),
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [`Your application is running here: http://localhost:${port}`],
      },
      clearConsole: true,
    }),
  ],
};
