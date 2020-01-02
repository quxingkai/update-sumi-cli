const path = require('path')
const fs = require('fs')

const cwd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));

const extensionId = `${pkg.publisher}.${pkg.name}`
const extensionUnderlineId = extensionId.replace(/\./g, '_').replace(/-/g, '_');

module.exports = {
  entry: path.join(cwd, 'src/extend/worker/index.ts'),
  output: {
    filename: 'index.js',
    path: path.join(cwd, 'out/extend/worker'),
    library: `kaitian_extend_browser_worker_${extensionUnderlineId}`,
    libraryTarget: 'var'
  },
  target: "webworker",
  optimization: {
    minimize: false
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  externals: {
    "kaitian": `kaitian.${extensionUnderlineId}`
  }
}
