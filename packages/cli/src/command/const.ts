import path from 'path';
import fs from 'fs';
import os from 'os';
import { promisify } from 'util';

export const npmClient = 'tnpm';

export const enginePkgName = '@ali/kaitian-integration';

export const kaitianInfraDir = path.resolve(os.homedir(), '.ali-kaitian-cli');

export const marketplaceApiAddress = 'https://marketplace.antfin-inc.com/openapi'
