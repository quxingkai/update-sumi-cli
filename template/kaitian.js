module.exports = {
  "activationEvents": "vscode",
  "browser": {
    "main": "out/extend/browser/index.js",
    "componentId": ["componentA", "componentB"]
  },
  "node": {
    "main": "out/extend/node/index.js"
  },
  "worker": {
    "main": "out/extend/worker/index.js"
  }
}
