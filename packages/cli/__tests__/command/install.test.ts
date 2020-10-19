import { InstallCommand } from '../../src/command/install';
import { runCli } from '../utils';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';

describe('kaitian install', () => {
  const extensionDir = path.join(os.tmpdir(), 'extensions');

  afterEach(async () => {
    await fs.emptyDir(extensionDir);
  });

  it('install extension', async () => {
    expect(await runCli(() => [InstallCommand], [
      'install',
      'vscode-extensions', 'bigfish-vscode', '0.0.20', extensionDir
    ])).toMatch(/installation completed.../);
    expect(await fs.ensureFile(path.join(extensionDir, 'vscode-extensions.bigfish-vscode-0.0.20', 'package.json')));
  });
})
