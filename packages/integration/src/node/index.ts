import { modules } from './modules';
import { startServer } from './server';

const argv = require('yargs-parser')(process.argv.slice(2));

const {
  serverPort,
  workspaceDir,
  extensionCandidate,
  isDev,
} = argv;

startServer({
  port: Number(serverPort as string),
  isDev: !!isDev,
  workspaceDir: workspaceDir as string,
  extensionCandidate: extensionCandidate ? strToArray(extensionCandidate as string | string[]) : undefined,
}, {
  modules,
});

function strToArray(item: string | string[]): string[] {
  return Array.isArray(item) ? item : [item];
}
