"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const koa_1 = __importDefault(require("koa"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const cors_1 = __importDefault(require("@koa/cors"));
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
const ide_core_common_1 = require("@ali/ide-core-common");
const ide_core_node_1 = require("@ali/ide-core-node");
const read_pkg_up_1 = __importDefault(require("read-pkg-up"));
const env = __importStar(require("./env"));
const openBrowser_1 = require("./openBrowser");
const ALLOW_MIME = {
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
const DEV_PATH = env.DEV_PATH;
const deviceIp = env.CLIENT_IP;
const extensionDir = path_1.default.join(DEV_PATH, "extensions");
async function startServer(serverParams, ideServerParams) {
    const { port = 50999, workspaceDir = __dirname, extensionCandidate = [__dirname], isDev, } = serverParams;
    console.log(extensionCandidate);
    if (!!isDev) {
        process.env.IS_DEV = "1";
    }
    process.env.EXT_MODE = "js";
    process.env.KTLOG_SHOW_DEBUG = "1";
    // process.env.EXTENSION_HOST_ENTRY = extHostPath;
    const app = new koa_1.default();
    const deferred = new ide_core_common_1.Deferred();
    // @ts-ignore
    app.use(cors_1.default());
    let opts = {
        workspaceDir: workspaceDir,
        extensionDir,
        webSocketHandler: [],
        use: app.use.bind(app),
        marketplace: {
            showBuiltinExtensions: true,
            accountId: "Eb0Ejh96qukCy_NzKNxztjzY",
            masterKey: "FWPUOR6NAH3mntLqKtNOvqKt",
            extensionDir: path_1.default.join(DEV_PATH, "extensions")
        },
        logDir: path_1.default.join(DEV_PATH, "logs"),
        logLevel: ide_core_common_1.LogLevel.Verbose,
        staticAllowPath: [extensionDir, ...extensionCandidate]
    };
    if (Array.isArray(ideServerParams.modules)) {
        opts = {
            ...opts,
            modules: ideServerParams.modules,
        };
    }
    if (ideServerParams.options) {
        opts = {
            ...opts,
            ...ideServerParams.options,
        };
    }
    const serverApp = new ide_core_node_1.ServerApp(opts);
    const server = http_1.default.createServer(app.callback());
    await serverApp.start(server);
    app.use(koa_mount_1.default("/", async (ctx, next) => {
        console.log("REQUEST URL:", ctx.url);
        let staticPath;
        let _path = ctx.url;
        if (_path.startsWith('/webview')) {
            staticPath = path_1.default.join(__dirname, `./${_path.split('?')[0]}`);
        }
        else if (_path === "/" || _path.endsWith(".html")) {
            _path = "/index.html";
            staticPath = path_1.default.join(__dirname, '../browser/index.html');
        }
        else {
            staticPath = path_1.default.join(__dirname, `../browser${_path}`);
        }
        const contentType = ALLOW_MIME[path_1.default.extname(_path).slice(1)];
        if (!fs_1.default.existsSync(staticPath)) {
            console.warn(`Load ${staticPath} failed.`);
            ctx.status = 404;
            ctx.body = "Not Found.";
            return;
        }
        let content = fs_1.default.readFileSync(staticPath).toString();
        if (_path === "/index.html") {
            const assets = fs_1.default.readFileSync(path_1.default.join(__dirname, `../browser/assets.json`)).toString();
            const config = {
                ideWorkspaceDir: workspaceDir,
                extensionDir: extensionDir,
                extensionCandidate,
                port,
                wsPath: `ws://${deviceIp}:${port}`,
                staticServicePath: `http://${deviceIp}:${port}`,
                webviewEndpoint: `http://${deviceIp}:${port}/webview`,
            };
            const { packageJson: pkg } = await read_pkg_up_1.default();
            const meta = {
                ideVersion: pkg.dependencies['@ali/ide-core-common'],
                engineVersion: pkg.version,
            };
            content = ejs_1.default.compile(content, {})({
                config,
                meta,
                assets: JSON.parse(assets),
            });
        }
        ctx.set("Content-Type", contentType);
        ctx.body = content;
    }));
    server.on("error", err => {
        deferred.reject(err);
        console.error("server error: " + err.message);
        setTimeout(process.exit, 0, 1);
    });
    server.listen(port, () => {
        console.log(`Server listen on port ${port}`);
        openBrowser_1.openBrowser(`http://${deviceIp}:${port}`);
        console.log(`
      服务启动成功，请点击 http://${deviceIp}:${port} 访问 Kaitian IDE.
    `);
        deferred.resolve(server);
    });
    return deferred.promise;
}
exports.startServer = startServer;
