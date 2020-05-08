import { Cli } from 'clipanion';
import chalk from 'chalk';
import semver from 'semver';

import { InitCommand } from './command/init';
import { WatchCommand, CompileCommand } from './command/bundle';
import { EngineUninstallCommand, EngineLsCommand, EngineLsRemoteCommand, EngineCurrentCommand, EngineUseCommand, EngineInstallCommand } from './command/engine';
import { DevCommand } from './command/dev';
import { PackageCommand } from './command/package';
import { InstallCommand, UpdateCommand } from './command/install';
import { PublishCommand } from './command/publish';
import { kaitianInfraDir } from './command/const';

import { ensureDirSync } from './util/fs';
import { HelpCommand, VersionCommand } from './command/help';
const pkg = require('../package.json');

(async () => {
  // check node version
  checkNodeVersion();
  prepareJobs();
})();

const cli = new Cli({
  binaryLabel: 'Kaitian IDE Extension Development Utility',
  binaryName: 'kaitian',
  binaryVersion: pkg.version,
});

[
  InitCommand,
  DevCommand,
  CompileCommand,
  WatchCommand,
  PackageCommand,
  InstallCommand,
  UpdateCommand,
  PublishCommand,
  EngineLsCommand,
  EngineLsRemoteCommand,
  EngineCurrentCommand,
  EngineUseCommand,
  EngineInstallCommand,
  EngineUninstallCommand,
  HelpCommand,
  VersionCommand,
].forEach((command) => {
  cli.register(command);
});

cli.runExit(process.argv.slice(2), {
  ...Cli.defaultContext,
});

function checkNodeVersion() {
  if (!semver.satisfies(process.version, pkg.engines.node)) {
    console.log(
      `\n`,
      chalk.red(
        `You must upgrade node to ${pkg.engines.node} to use Kaitian Cli`,
      ),
      `\n`,
    );
    process.exit(1);
  }
}

function prepareJobs() {
  ensureDirSync(kaitianInfraDir);
}
