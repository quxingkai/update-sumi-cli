const path = require('path');
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

module.exports = {
  entry: path.join(__dirname, '../src/extend/browser/index.ts'),
  output: {
    filename: 'index.js',
    path: path.join(__dirname, '../out/extend/browser'),
    library: `extend-browser-${pkg.name}`,
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [[
                'babel-plugin-import',
                {
                  libraryName: 'antd',
                  libraryDirectory: 'lib',
                  style: true,
                },
                'antd'
              ]],
              cacheDirectory: true,
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'ES6'
              }
            }
          },
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            }
          }
        ],
      },
    ],
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
};
