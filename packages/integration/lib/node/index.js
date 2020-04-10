"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var modules_1 = require("./modules");
var server_1 = require("./server");
var _a = yargs.argv, serverPort = _a.serverPort, workspaceDir = _a.workspaceDir, extensionCandidate = _a.extensionCandidate, isDev = _a.isDev;
server_1.startServer({
    port: Number(serverPort),
    isDev: !!isDev,
    workspaceDir: workspaceDir,
    extensionCandidate: extensionCandidate ? strToArray(extensionCandidate) : undefined,
}, {
    modules: modules_1.modules,
});
function strToArray(item) {
    return Array.isArray(item) ? item : [item];
}
