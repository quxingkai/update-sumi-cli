import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Package as NPMPackageJSON } from 'normalize-package-data';

import { safeParseJson } from './json';

export interface ExtensionPackageJSON extends NPMPackageJSON {
  publisher: string;
}

export async function getExtPkgContent(): Promise<ExtensionPackageJSON | undefined> {
  try {
    const json = await promisify(fs.readFile)(
      path.join(process.cwd(), 'package.json'),
      'utf-8',
    );
    return safeParseJson(json);
  } catch(e) {
    return undefined;
  }
}
