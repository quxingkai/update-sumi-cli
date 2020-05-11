import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export async function getExtPkgContent() {
  const json = await promisify(fs.readFile)(
    path.join(process.cwd(), 'package.json'),
    'utf-8',
  );
  return JSON.parse(json);
}
