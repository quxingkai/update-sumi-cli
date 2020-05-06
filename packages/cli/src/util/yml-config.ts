import yaml from 'yaml';
import fs from 'fs';
import path from 'path';

import { ensureDirSync, ensureFileSync, ensureDir } from './fs';

const fsPromise = fs.promises;

export class YmlConfiguration<T = any> {
  constructor(
    private readonly rootDir: string,
    private readonly ymlFileName: string,
  ) {}

  public readYmlSync(): T {
    ensureDirSync(this.rootDir);
    const ymlPath = path.join(this.rootDir, this.ymlFileName);
    ensureFileSync(ymlPath);
    const ymlContent = fs.readFileSync(ymlPath, { encoding: 'utf8' });
    return yaml.parse(ymlContent) || {};
  }

  public async readYml(): Promise<T> {
    await ensureDir(this.rootDir);
    const ymlPath = path.join(this.rootDir, this.ymlFileName);
    ensureFileSync(ymlPath);
    const ymlContent = await fsPromise.readFile(ymlPath, 'utf8');
    return yaml.parse(ymlContent) || {};
  }

  public writeYmlSync(content: Partial<T>): void {
    ensureDirSync(this.rootDir);
    const ymlPath = path.join(this.rootDir, this.ymlFileName);
    fs.openSync(ymlPath, 'w');
    const ymlContent = fs.readFileSync(ymlPath, 'utf8');
    return fs.writeFileSync(
      ymlPath,
      yaml.stringify(Object.assign({}, ymlContent, content)),
      'utf8',
    );
  }

  public async writeYml(content: Partial<T>): Promise<void> {
    await ensureDir(this.rootDir);
    const ymlPath = path.join(this.rootDir, this.ymlFileName);
    await fsPromise.open(ymlPath, 'w');
    const ymlContent = await fsPromise.readFile(ymlPath, 'utf8');
    return await fsPromise.writeFile(
      ymlPath,
      yaml.stringify(Object.assign({}, ymlContent, content)),
      'utf8',
    );
  }
}
