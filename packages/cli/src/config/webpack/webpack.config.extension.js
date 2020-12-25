const withDefaults = require('./shared.webpack.config');
const path = require('path');

module.exports = (options) => withDefaults({
	context: path.resolve(options.cwd),
	entry: {
		extension: path.join(options.cwd, 'src/extension.ts'),
	},
	output: {
		filename: 'extension.js',
		path: path.join(options.cwd, 'out')
	}
});
