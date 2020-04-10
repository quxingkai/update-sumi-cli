"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ide_express_file_server_1 = require("@ali/ide-express-file-server");
var node_1 = require("@ali/ide-file-service/lib/node");
var node_2 = require("@ali/ide-storage/lib/node");
var node_3 = require("@ali/ide-extension-storage/lib/node");
var ide_process_1 = require("@ali/ide-process");
var ide_search_1 = require("@ali/ide-search");
var node_4 = require("@ali/ide-terminal-next/lib/node");
var node_5 = require("@ali/ide-logs/lib/node");
var ide_kaitian_extension_1 = require("@ali/ide-kaitian-extension");
var node_6 = require("@ali/ide-debug/lib/node");
var ide_extension_manager_1 = require("@ali/ide-extension-manager");
var node_7 = require("@ali/ide-file-scheme/lib/node");
exports.modules = [
    node_5.LogServiceModule,
    node_1.FileServiceModule,
    node_3.ExtensionStorageModule,
    node_2.StorageModule,
    ide_process_1.ProcessModule,
    ide_search_1.SearchModule,
    node_4.TerminalNodePtyModule,
    node_6.DebugModule,
    ide_kaitian_extension_1.KaitianExtensionModule,
    ide_extension_manager_1.ExtensionManagerModule,
    node_7.FileSchemeNodeModule,
    ide_express_file_server_1.ExpressFileServerModule,
];
