import * as path from "path";
import * as http from "http";
import * as Koa from "koa";
import * as os from "os";
import * as mount from "koa-mount";
import * as cors from '@koa/cors';
import { JSDOM } from "jsdom";
import * as fs from "fs";
import { Deferred, LogLevel } from "@ali/ide-core-common";
import { IServerAppOpts, ServerApp, NodeModule } from "@ali/ide-core-node";
import * as ip from 'ip';
import { ConstructorOf } from "@ali/common-di";

const openBrowser = require('../../lib/openBrowser');

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

const DEV_PATH = path.join(os.homedir(), ".kaitian-dev");
const deviceIp = ip.address();

const extensionDir = path.join(DEV_PATH, "extensions");

interface IDEServerParams {
  modules?: ConstructorOf<NodeModule>[];
  options?: Partial<IServerAppOpts>;
}

interface ServerParams {
  port: number;
  isDev: boolean;
  workspaceDir?: string;
  extensionCandidate?: string[];
}

export async function startServer(serverParams: ServerParams, ideServerParams: IDEServerParams) {
  const {
    port = 50999,
    workspaceDir = __dirname,
    extensionCandidate = [__dirname],
    isDev,
  } = serverParams;
  console.log(extensionCandidate);

  const isDevelopment = !!isDev;

  if (isDevelopment) {
    process.env.IS_DEV = "1";
  }

  process.env.EXT_MODE = "js";
  process.env.KTLOG_SHOW_DEBUG = "1";
  // process.env.EXTENSION_HOST_ENTRY = extHostPath;

  const app = new Koa();
  const deferred = new Deferred<http.Server>();

  // @ts-ignore
  app.use(cors());
  let opts: IServerAppOpts = {
    workspaceDir: workspaceDir,
    extensionDir,
    webSocketHandler: [],
    use: app.use.bind(app),
    marketplace: {
      showBuiltinExtensions: true,
      accountId: "Eb0Ejh96qukCy_NzKNxztjzY",
      masterKey: "FWPUOR6NAH3mntLqKtNOvqKt",
      extensionDir: path.join(DEV_PATH, "extensions")
    },
    logDir: path.join(DEV_PATH, "logs"),
    logLevel: LogLevel.Verbose,
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

  const serverApp = new ServerApp(opts);
  const server = http.createServer(app.callback());
  await serverApp.start(server);

  app.use(
    mount<{}>("/", (ctx, next) => {
      console.log("REQUEST URL:", ctx.url);
      let staticPath;
      let _path = ctx.url;
      if (_path.startsWith('/webview')) {
        staticPath = path.join(__dirname, `./${_path.split('?')[0]}`);
      } else if (_path === "/" || _path.endsWith(".html")) {
        _path = "/index.html";
        staticPath = path.join(__dirname, '../browser/index.html');
      } else {
        staticPath = path.join(__dirname, `../browser${_path}`);
      }

      const contentType = ALLOW_MIME[path.extname(_path).slice(1)];
      if (!fs.existsSync(staticPath)) {
        console.warn(`Load ${staticPath} failed.`);
        ctx.status = 404;
        ctx.body = "Not Found.";
        return;
      }

      let content = fs.readFileSync(staticPath).toString();

      if (_path === "/index.html") {
        const dom = new JSDOM(content);
        const script = dom.window.document.createElement("script");
        script.textContent = `
        window.KAITIAN_SDK_CONFIG = {
          ideWorkspaceDir: "${workspaceDir}",
          extensionDir: "${extensionDir}",
          extensionCandidate: ${JSON.stringify(extensionCandidate)},
          port: "${port}",
          wsPath: "ws://${deviceIp}:${port}",
          staticServicePath: "http://${deviceIp}:${port}",
          webviewEndpoint: "http://${deviceIp}:${port}/webview",
        } 
      `;
        const main = dom.window.document.body.querySelector("#main");
        dom.window.document.body.insertBefore(script, main);
        content = dom.serialize();
      }
      ctx.set("Content-Type", contentType);
      ctx.body = content;
    })
  );


  server.on("error", err => {
    deferred.reject(err);
    console.error("server error: " + err.message);
    setTimeout(process.exit, 0, 1);
  });

  server.listen(port, () => {
    console.log(`Server listen on port ${port}`);
    openBrowser(`http://${deviceIp}:${port}`);

    console.log(`
      服务启动成功，请点击 http://${deviceIp}:${port} 访问 Kaitian IDE.
    `);

    deferred.resolve(server);
  });
  return deferred.promise;
}
