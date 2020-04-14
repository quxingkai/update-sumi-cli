"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_modules_1 = require("@ali/ide-startup/lib/node/common-modules");
const ide_express_file_server_1 = require("@ali/ide-express-file-server");
exports.modules = [
    ...common_modules_1.CommonNodeModules,
    ide_express_file_server_1.ExpressFileServerModule,
];
