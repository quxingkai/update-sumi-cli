module.exports = {
  "activationEvents": "vscode",
  "browser": {
    "main": "out/browser/index.js",
    "componentId": ["componentA", "componentB"],
  },
  "node": {
    "main": "out/node/index.js",
  },
  "worker": {
    "main": "out/worker/index.js",
  },
};
