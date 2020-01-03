import "@ali/ide-i18n/lib/browser";
import { CommonBrowserModules } from "@ali/ide-startup/lib/browser/common-modules";
import { BrowserModule, ConstructorOf, SlotLocation } from "@ali/ide-core-browser";
import { ExpressFileServerModule } from "@ali/ide-express-file-server/lib/browser";
import "@ali/ide-core-browser/lib/style/index.less";
import "@ali/ide-core-browser/lib/style/icon.less";

import { renderApp } from "./app";

export const modules: ConstructorOf<BrowserModule>[] = [
  ...CommonBrowserModules,
  ExpressFileServerModule
];

const layoutConfig = {
  [SlotLocation.top]: {
    modules: ['@ali/ide-menu-bar', 'toolbar'],
  },
  [SlotLocation.left]: {
    modules: ['@ali/ide-explorer', '@ali/ide-search', '@ali/ide-scm', '@ali/ide-extension-manager', '@ali/ide-debug'],
  },
  [SlotLocation.right]: {
    modules: [],
  },
  [SlotLocation.main]: {
    modules: ['@ali/ide-editor'],
  },
  [SlotLocation.bottom]: {
    modules: ['@ali/ide-terminal-next', '@ali/ide-output', 'debug-console', '@ali/ide-markers'],
  },
  [SlotLocation.statusBar]: {
    modules: ['@ali/ide-status-bar'],
  },
  [SlotLocation.extra]: {
    modules: ['breadcrumb-menu'],
  },
};

renderApp({
  layoutConfig,
  useCdnIcon: false,
  modules,
  defaultPreferences: {
    "general.theme": "ide-dark",
    "general.icon": "vscode-icons"
  }
});
