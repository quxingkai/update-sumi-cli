"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var modules_1 = require("./modules");
var server_1 = require("./server");
var argv = require('yargs-parser')(process.argv.slice(2));
var serverPort = argv.serverPort, workspaceDir = argv.workspaceDir, extensionCandidate = argv.extensionCandidate, isDev = argv.isDev;
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
