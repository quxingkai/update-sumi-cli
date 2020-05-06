import fs from 'fs';

const fsPromise = fs.promises;

export async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    await fsPromise.mkdir(dir);
  }
}

export function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

export function ensureFileSync(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', { encoding: 'utf8' });
  }
}

export async function ensureFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    await fsPromise.writeFile(filePath, '', { encoding: 'utf8' });
  }
}
