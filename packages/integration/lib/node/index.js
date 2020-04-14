"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("./modules");
const server_1 = require("./server");
const argv = require('yargs-parser')(process.argv.slice(2));
const { serverPort, workspaceDir, extensionCandidate, isDev, } = argv;
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
