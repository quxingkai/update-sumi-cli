"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var http = require("http");
var Koa = require("koa");
var mount = require("koa-mount");
var cors = require("@koa/cors");
var fs = require("fs");
var ejs = require("ejs");
var ide_core_common_1 = require("@ali/ide-core-common");
var ide_core_node_1 = require("@ali/ide-core-node");
var env = require('../../lib/env');
var openBrowser = require('../../lib/openBrowser');
var ALLOW_MIME = {
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    ttf: "font/ttf",
    eot: "font/eot",
    otf: "font/otf",
    woff: "font/woff",
    woff2: "font/woff2",
    js: "application/javascript",
    css: "text/css"
};
var DEV_PATH = env.DEV_PATH;
var deviceIp = env.CLIENT_IP;
var extensionDir = path.join(DEV_PATH, "extensions");
function startServer(serverParams, ideServerParams) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, port, _b, workspaceDir, _c, extensionCandidate, isDev, app, deferred, opts, serverApp, server;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = serverParams.port, port = _a === void 0 ? 50999 : _a, _b = serverParams.workspaceDir, workspaceDir = _b === void 0 ? __dirname : _b, _c = serverParams.extensionCandidate, extensionCandidate = _c === void 0 ? [__dirname] : _c, isDev = serverParams.isDev;
                    console.log(extensionCandidate);
                    if (!!isDev) {
                        process.env.IS_DEV = "1";
                    }
                    process.env.EXT_MODE = "js";
                    process.env.KTLOG_SHOW_DEBUG = "1";
                    app = new Koa();
                    deferred = new ide_core_common_1.Deferred();
                    // @ts-ignore
                    app.use(cors());
                    opts = {
                        workspaceDir: workspaceDir,
                        extensionDir: extensionDir,
                        webSocketHandler: [],
                        use: app.use.bind(app),
                        marketplace: {
                            showBuiltinExtensions: true,
                            accountId: "Eb0Ejh96qukCy_NzKNxztjzY",
                            masterKey: "FWPUOR6NAH3mntLqKtNOvqKt",
                            extensionDir: path.join(DEV_PATH, "extensions")
                        },
                        logDir: path.join(DEV_PATH, "logs"),
                        logLevel: ide_core_common_1.LogLevel.Verbose,
                        staticAllowPath: __spreadArrays([extensionDir], extensionCandidate)
                    };
                    if (Array.isArray(ideServerParams.modules)) {
                        opts = __assign(__assign({}, opts), { modules: ideServerParams.modules });
                    }
                    if (ideServerParams.options) {
                        opts = __assign(__assign({}, opts), ideServerParams.options);
                    }
                    serverApp = new ide_core_node_1.ServerApp(opts);
                    server = http.createServer(app.callback());
                    return [4 /*yield*/, serverApp.start(server)];
                case 1:
                    _d.sent();
                    app.use(mount("/", function (ctx, next) {
                        console.log("REQUEST URL:", ctx.url);
                        var staticPath;
                        var _path = ctx.url;
                        if (_path.startsWith('/webview')) {
                            staticPath = path.join(__dirname, "./" + _path.split('?')[0]);
                        }
                        else if (_path === "/" || _path.endsWith(".html")) {
                            _path = "/index.html";
                            staticPath = path.join(__dirname, '../browser/index.html');
                        }
                        else {
                            staticPath = path.join(__dirname, "../browser" + _path);
                        }
                        var contentType = ALLOW_MIME[path.extname(_path).slice(1)];
                        if (!fs.existsSync(staticPath)) {
                            console.warn("Load " + staticPath + " failed.");
                            ctx.status = 404;
                            ctx.body = "Not Found.";
                            return;
                        }
                        var content = fs.readFileSync(staticPath).toString();
                        if (_path === "/index.html") {
                            var assets = fs.readFileSync(path.join(__dirname, "../browser/assets.json")).toString();
                            var config = {
                                ideWorkspaceDir: workspaceDir,
                                extensionDir: extensionDir,
                                extensionCandidate: JSON.stringify(extensionCandidate),
                                port: port,
                                wsPath: "ws://" + deviceIp + ":" + port,
                                staticServicePath: "http://" + deviceIp + ":" + port,
                                webviewEndpoint: "http://" + deviceIp + ":" + port + "/webview",
                            };
                            content = ejs.compile(content, {})({ config: config, assets: JSON.parse(assets) });
                        }
                        ctx.set("Content-Type", contentType);
                        ctx.body = content;
                    }));
                    server.on("error", function (err) {
                        deferred.reject(err);
                        console.error("server error: " + err.message);
                        setTimeout(process.exit, 0, 1);
                    });
                    server.listen(port, function () {
                        console.log("Server listen on port " + port);
                        openBrowser("http://" + deviceIp + ":" + port);
                        console.log("\n      \u670D\u52A1\u542F\u52A8\u6210\u529F\uFF0C\u8BF7\u70B9\u51FB http://" + deviceIp + ":" + port + " \u8BBF\u95EE Kaitian IDE.\n    ");
                        deferred.resolve(server);
                    });
                    return [2 /*return*/, deferred.promise];
            }
        });
    });
}
exports.startServer = startServer;
