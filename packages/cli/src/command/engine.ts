import os from 'os';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import execa from 'execa';
import chalk from 'chalk';
import rimraf from 'rimraf';
import ora from 'ora';
import { Command } from 'clipanion';

import { safeParseJson } from '../util/json';
import { ensureDir } from '../util/fs';
import { YmlConfiguration } from '../util/yml-config';
import { kaitianInfraDir } from './const';

const { npmClient, enginePkgName } = require('./const');

const fsPromise = fs.promises;

const engineDir = path.resolve(kaitianInfraDir, 'engines');

function getEngineFolderPath(version: string) {
  return path.join(engineDir, version);
}

async function getPkgJSONFile(targetDir: string, version: string) {
  const pkgJsonDesc = {
    name: '@ali/kaitian-engine',
    version,
    dependencies: {
      '@ali/kaitian-integration': version,
    }
  };
  const json = JSON.stringify(pkgJsonDesc, null, 2);
  const pkgJSONFilePath = path.join(targetDir, 'package.json');
  // await fsPromise.open(pkgJSONFilePath, 'w');
  await fsPromise.writeFile(pkgJSONFilePath, json, 'utf8');
}

interface EngineYml {
  current: string;
}

export function whenReady(target: any, propertyKey: string, desc: PropertyDescriptor) {
  const origin = target[propertyKey];
  desc.value = async function(...params: any[]) {
    await this['ready'];
    return await origin.apply(this, params);
  };
}

class EngineModule {
  protected ready: Promise<any>;

  private readonly ymlConfig: YmlConfiguration;

  constructor() {
    this.ymlConfig = new YmlConfiguration<EngineYml>(engineDir, 'engine.yml');
    this.ready = this.init();
  }

  get currentEnginePath() {
    if (!this.current) {
      console.warn(chalk.yellow('Please install an engine firstly'));
      process.exit(1);
    }

    // console.log
    // /engines/1.0.0-alpha.0/node_modules/@ali/kaitian-integration/lib
    return path.join(engineDir, this.current, 'node_modules', enginePkgName, 'lib');
  }

  get current() {
    const config = this.ymlConfig.readYmlSync();
    return config.current;
  }

  set current(value: string) {
    const config = this.ymlConfig.readYmlSync();
    this.ymlConfig.writeYmlSync({ ...config, current: value });
  }

  @whenReady
  public async add(v?: string) {
    const version = this.checkValidVersionStr(v);
    const engineDir = getEngineFolderPath(version);
    // 这里从完备性上来说还要检查 node_modules 和 package.json
    if (fs.existsSync(engineDir)) {
      console.log('Engine', version, 'was already installed');
      return;
    }
    if (!fs.existsSync(engineDir)) {
      await fsPromise.mkdir(engineDir);
    }

    await this.installEngine(engineDir, version);
    console.log(`Engine@v${version} was installed`);
    if (!await this.getCurrent()) {
      await this.setCurrent(version);
    }
  }

  public async remove(v?: string) {
    const version = this.checkValidVersionStr(v);
    const engineDir = getEngineFolderPath(version);
    if (!fs.existsSync(engineDir)) {
      console.warn('Engine@v', version, 'was not existed');
      return;
    }
    const spinner = ora(`Removing engine@v${version}`).start();
    await promisify(rimraf)(engineDir);
    spinner.succeed(`Engine@v${version} was removed`);
    // 重新 init
    this.ready = this.init();
  }

  @whenReady
  public async list() {
    const engineList = await this.getInstalledEngines();
    const stdoutList = engineList
      .map(version => {
        let result = version;
        let color = 'blue';
        // installed mark
        if (this.current === version) {
          result = '-> ' + result;
          color = 'green';
        }
        return chalk[color](result.padStart(25))
      })
      .join('\n');
    console.log(stdoutList);
  }

  @whenReady
  public async listRemote() {
    const engineList = await this.getRemoteEngines() || [];
    const taggedVersion = await this.getTaggedVersions();
    const reversedTaggedVersionDesc = Object.keys(taggedVersion)
      .reduce((prev, distTag) => {
        const version = taggedVersion[distTag];
        prev[version] = (prev[version] || []).concat(distTag);
        return prev;
      }, {} as { [key: string]: string[] });

    // installed
    const installedEngineList = await this.getInstalledEngines();

    const stdoutList = engineList
      .map(version => {
        let result = version;
        let color: string = '';
        const distTags = reversedTaggedVersionDesc[version];
        // installed mark
        if (installedEngineList.includes(version)) {
          color = 'blue';
        }

        // installed mark
        if (this.current === version) {
          result = '-> ' + result;
          color = 'green';
        }

        result = result.padStart(25);

        // dist-tag mark
        if (Array.isArray(distTags) && distTags.length) {
          result = result + '   ' + distTags.join(',');
        }

        return color ? chalk[color](result) : result;
      })
      .join('\n');
    // installed
    // tagged
    console.log(stdoutList);
  }

  @whenReady
  public async use(v?: string) {
    const version = await this.checkEngineVersion(v);
    await this.ymlConfig.writeYml({ current: version });
  }

  private async getCurrent() {
    const config = await this.ymlConfig.readYml();
    return config.current;
  }

  private async setCurrent(value: string) {
    const config = await this.ymlConfig.readYml();
    await this.ymlConfig.writeYml({ ...config, current: value });
    console.log(`Set v${value} as the current engine`);
  }

  private async installEngine(targetDir: string, version: string) {
    await getPkgJSONFile(targetDir, version);
    await execa.command(`${npmClient} install`, { cwd: targetDir })
      .stdout!.pipe(process.stdout);
  }

  private async init() {
    const engineList = await this.getInstalledEngines();
    if (!engineList.length) {
      // console.warn('No engine installed');
      // console.warn('Please exec `kaitian cli install`');
    }

    const config = await this.ymlConfig.readYml();
    if (!config.current || !engineList.includes(config.current)) {
      // fallback to the first in engineList
      const current = engineList[0];
      await this.ymlConfig.writeYml({ ...config, current });
      // console.warn(`We are using engine@v${current }`);
    }
  }

  private async getRemoteEngines(): Promise<string[] | undefined> {
    // check remote version in ${npmClient}
    const { stdout } = await execa(npmClient, ['view', enginePkgName, 'versions']);
    if (stdout.length) {
      // stdout looks like this: [ '16.12.0', '16.13.0' ]
      const versionList = safeParseJson<string[]>(stdout.replace(/\'/g, '"'));
      return versionList;
    }
    return undefined;
  }

  private async getTaggedVersions() {
    const { stdout } = await execa(npmClient, ['dist-tag', 'ls', enginePkgName]);
    const result = stdout
      .split('\n')
      .reduce((prev, cur) => {
        if (cur.length) {
          const [ distTagStr, versionStr] = cur.split(':');
          const distTag = distTagStr.trim();
          const version = versionStr.trim();
          prev[distTag] = version;
        }
        return prev;
      }, {} as {
        [key: string]: string;
      });

    return result;
  }

  private checkValidVersionStr(version?: string): string {
    // empty checking
    if (!version) {
      throw new Error('Please input a valid version');
    }
    return version.trim();
  }

  private async checkEngineVersion(v?: string): Promise<string> {
    const version = this.checkValidVersionStr(v);

    // check installed versions
    const engineList = await this.getInstalledEngines();
    if (engineList.includes(version)) {
      return version;
    }

    // check remote version in ${npmClient}
    const versionList = await this.getRemoteEngines();
    if (!versionList) {
      throw new Error(`${npmClient} view ${enginePkgName} versions return empty result`);
    }

    if (!versionList.includes(version)) {
      throw new Error(`${enginePkgName}@${v} is invalid`);
    }

    return version;
  }

  // memoized for 5s
  private async getInstalledEngines() {
    await ensureDir(kaitianInfraDir);
    await ensureDir(engineDir);
    const files = await fsPromise.readdir(engineDir);
    const fileNameList = await Promise.all(files.map(async (fileName) => {
      const filePath = path.join(engineDir, fileName);
      const stat = await fsPromise.stat(filePath);
      return stat.isDirectory() ? fileName : '';
    }));
    const engineVersionList = fileNameList.filter(n => !!n);
    return engineVersionList;
  }
}

export const engineModule = new EngineModule();

export class EngineLsCommand extends Command {
  static usage = Command.Usage({
    description: 'list installed engine versions',
  });

  @Command.Path('engine', 'ls')
  async execute() {
    engineModule.list();
  }
}

export class EngineLsRemoteCommand extends Command {
  static usage = Command.Usage({
    description: 'list remote engine versions available for install',
  });

  @Command.Path('engine', 'ls-remote')
  async execute() {
    engineModule.listRemote();
  }
}

export class EngineCurrentCommand extends Command {
  static usage = Command.Usage({
    description: 'display currently selected version',
  });

  @Command.Path('engine', 'current')
  async execute() {
    console.log(engineModule.current);
  }
}

export class EngineUseCommand extends Command {
  static usage = Command.Usage({
    description: 'Change current engine to [version]',
  });

  @Command.String({ required: true })
  public version!: string;

  @Command.Path('engine', 'use')
  async execute() {
    engineModule.use(this.version);
  }
}

export class EngineInstallCommand extends Command {
  static usage = Command.Usage({
    description: 'Download and install a [version]',
  });

  @Command.String()
  public version!: string;

  @Command.Path('engine', 'install')
  async execute() {
    await engineModule.add(this.version);
  }
}

export class EngineUninstallCommand extends Command {
  static usage = Command.Usage({
    description: 'Remove specific [version] engine',
  });

  @Command.String()
  public version!: string;

  @Command.Path('engine', 'uninstall')
  async execute() {
    await engineModule.remove(this.version);
  }
}
