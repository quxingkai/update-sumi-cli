const path = require('path');
const fs = require('fs');

const cwd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));

module.exports = {
  entry: path.join(cwd, 'src/extend/node/index.ts'),
  output: {
    filename: 'index.js',
    path: path.join(cwd, 'out/extend/node'),
    library: `extend-node-${pkg.name}`,
    libraryTarget: "commonjs2",
  },
  target: 'node',
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
  externals: {
    "kaitian": "kaitian",
    "vscode": "vscode"
  },
};
