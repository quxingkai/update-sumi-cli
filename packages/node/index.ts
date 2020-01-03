import { startServer } from './server'
import { ExpressFileServerModule } from '@ali/ide-express-file-server';
import { NodeModule, ConstructorOf} from '@ali/ide-core-node';
import { FileServiceModule } from '@ali/ide-file-service/lib/node';
import { StorageModule } from '@ali/ide-storage/lib/node';
import { ExtensionStorageModule } from '@ali/ide-extension-storage/lib/node';
import { ProcessModule } from '@ali/ide-process';
import { SearchModule } from '@ali/ide-search';
import { TerminalNodePtyModule } from '@ali/ide-terminal-next/lib/node';
import { LogServiceModule } from '@ali/ide-logs/lib/node';
import { KaitianExtensionModule } from '@ali/ide-kaitian-extension';
import { DebugModule } from '@ali/ide-debug/lib/node';
// import { DebugNodejsModule } from '@ali/ide-debug-nodejs/lib/node';
import { ExtensionManagerModule } from '@ali/ide-extension-manager';
import { FileSchemeNodeModule } from '@ali/ide-file-scheme/lib/node';

export const modules: ConstructorOf<NodeModule>[] = [
  LogServiceModule,
  FileServiceModule,
  ExtensionStorageModule,
  StorageModule,
  ProcessModule,
  SearchModule,
  TerminalNodePtyModule,
  DebugModule,
  // DebugNodejsModule,
  KaitianExtensionModule,
  ExtensionManagerModule,
  FileSchemeNodeModule,
  ExpressFileServerModule,
];

startServer({
  modules,
});
