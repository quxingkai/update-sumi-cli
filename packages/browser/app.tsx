import { ClientApp, IClientAppOpts } from '@ali/ide-core-browser';
import { Injector } from '@ali/common-di';

export async function renderApp(opts: IClientAppOpts) {

  const injector = new Injector();
  const extnsions: string[] = [...(window as any).KAITIAN_SDK_CONFIG.extensionCandidate].filter(Boolean);
  opts.extensionCandidate = extnsions.map((e) => ({ path: e, isBuiltin: true }));
  opts.workspaceDir = (window as any).KAITIAN_SDK_CONFIG.ideWorkspaceDir;
  opts.coreExtensionDir = (window as any).KAITIAN_SDK_CONFIG.extensionDir;
  opts.extensionDir = (window as any).KAITIAN_SDK_CONFIG.extensionDir;
  opts.wsPath = (window as any).KAITIAN_SDK_CONFIG.wsPath;
  opts.staticServicePath = (window as any).KAITIAN_SDK_CONFIG.staticServicePath;
  opts.webviewEndpoint = (window as any).KAITIAN_SDK_CONFIG.webviewEndpoint;
  opts.extWorkerHost = './worker-host.js';

  opts.injector = injector;
  const app = new ClientApp(opts);

  await app.start(document.getElementById('main')!, 'web');
}
