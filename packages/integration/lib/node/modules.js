"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_modules_1 = require("@ali/ide-startup/lib/node/common-modules");
var ide_express_file_server_1 = require("@ali/ide-express-file-server");
exports.modules = __spreadArrays(common_modules_1.CommonNodeModules, [
    ide_express_file_server_1.ExpressFileServerModule,
]);
