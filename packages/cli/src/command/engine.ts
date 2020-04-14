import os from 'os';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import yaml from 'yaml';
import execa from 'execa';
import chalk from 'chalk';
import rimraf from 'rimraf';
import ora from 'ora';

import { safeParseJson } from './util';

const { npmClient, enginePkgName } = require('./const');

const fsPromise = fs.promises;

const engineDir = path.resolve(os.tmpdir(), 'ali-kaitian-engine');

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    await fsPromise.mkdir(dir);
  }
}

async function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function ensureFileSync(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', { encoding: 'utf8' });
  }
}

async function ensureFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    await fsPromise.writeFile(filePath, '', { encoding: 'utf8' });
  }
}

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

async function checkEngine(version: string) {
  const targetDir = getEngineFolderPath(version);
  // 这里从完备性上来说还要检查 node_modules 和 package.json
  if (fs.existsSync(targetDir)) {
    console.log('engine', version, 'installed');
    return true;
  }
  // await installEngine(targetDir, version);
}

// alpha: 1.0.0-alpha.0
// latest: 1.0.0-alpha.0
function getLatestVersion(stdout: string) {
  const [latestVersionStr] = stdout
    .split('\n')
    .filter(n => n.startsWith('latest'));

  return latestVersionStr.replace('latest:', '').trim();
}

async function checkUpdate() {
  const { stdout } = await execa(npmClient, ['dist-tag', 'ls', enginePkgName]);
  const latestVersion = getLatestVersion(stdout);
}

// checkUpdate();

// (async () => {
//   try {
//     await ensureDir(engineDir);

//     await scanEngineDir();

//     await checkEngine('1.0.0-alpha.0');
//   } catch (err) {
//     console.log(err);
//   }
// })();

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

export class EngineModule {
  protected ready: Promise<any>;

  constructor() {
    this.ready = this.init();
  }

  get currentEnginePath() {
    // os_tmpdir/ali-kaitian-engine/1.0.0-alpha.0/node_modules/@ali/kaitian-integration/lib
    return path.join(engineDir, this.current, 'node_modules', enginePkgName, 'lib');
  }

  get current() {
    const config = this.readEngineYmlSync();
    return config.current;
  }

  set current(value: string) {
    const config = this.readEngineYmlSync();
    this.writeEngineYmlSync({ ...config, current: value });
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
    await this.writeEngineYml({ current: version });
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

    const config = await this.readEngineYml();
    if (!config.current || !engineList.includes(config.current)) {
      // fallback to the first in engineList
      const current = engineList[0];
      await this.writeEngineYml({ ...config, current });
      // console.warn(`We are using engine@v${current }`);
    }
  }

  private async getCurrent() {
    const config = await this.readEngineYml();
    return config.current;
  }

  private async setCurrent(current: string) {
    const config = await this.readEngineYml();
    await this.writeEngineYml({ ...config, current });
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

  private readEngineYmlSync() {
    ensureDirSync(engineDir);
    const ymlPath = path.join(engineDir, 'engine.yml');
    ensureFileSync(ymlPath);
    const ymlContent = fs.readFileSync(ymlPath, { encoding: 'utf8' });
    return yaml.parse(ymlContent) || {};
  }

  private async readEngineYml() {
    await ensureDir(engineDir);
    const ymlPath = path.join(engineDir, 'engine.yml');
    ensureFileSync(ymlPath);
    const ymlContent = await fsPromise.readFile(ymlPath, 'utf8');
    return yaml.parse(ymlContent) || {};
  }

  private writeEngineYmlSync(content: Partial<EngineYml>) {
    ensureDirSync(engineDir);
    const ymlPath = path.join(engineDir, 'engine.yml');
    fs.openSync(ymlPath, 'w');
    const ymlContent = fs.readFileSync(ymlPath, 'utf8');
    return fs.writeFileSync(
      ymlPath,
      yaml.stringify(Object.assign({}, ymlContent, content)),
      'utf8',
    );
  }

  private async writeEngineYml(content: Partial<EngineYml>) {
    await ensureDir(engineDir);
    const ymlPath = path.join(engineDir, 'engine.yml');
    await fsPromise.open(ymlPath, 'w');
    const ymlContent = await fsPromise.readFile(ymlPath, 'utf8');
    return await fsPromise.writeFile(
      ymlPath,
      yaml.stringify(Object.assign({}, ymlContent, content)),
      'utf8',
    );
  }
}
