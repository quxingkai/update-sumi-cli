import { get, uniq, flattenDeep } from 'lodash';
import { safeParseJson } from './json';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

export const execBasePath = process.cwd();

export const metaFilePath = path.resolve(execBasePath, './meta.json');

export const useKeyPathDirect = Symbol('useKeyPath');

const isURL = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const touchedFiles: Set<string> = new Set();

export const ANALYSIS_ENTRY_LIST = [
  'package.json',
].map(entry => path.resolve(execBasePath, entry));


export const ANALYSIS_FIELD_PATH: { [key: string]: string | symbol } = ['contributes', 'kaitianContributes'].reduce((preResult, curPrefix) => ({
  ...preResult,
  [`${curPrefix}.iconThemes`]: 'path',
  [`${curPrefix}.iconThemes`]: 'configuration',
  [`${curPrefix}.grammars`]: 'path',
  [`${curPrefix}.themes`]: 'path',
  [`${curPrefix}.snippets`]: 'path',
  [`${curPrefix}.jsonValidation`]: 'url',
  [`${curPrefix}.browserMain`]: useKeyPathDirect,
  [`${curPrefix}.workerMain`]: useKeyPathDirect,
}), {})

const getAppendResource = (obj: any): string[] => {
  const fields = ['include'];
  return fields.reduce((pre: string[], cur: string) => {
    const next = get(obj, cur);

    if (typeof next === 'undefined') {
      return pre;
    }

    return flattenDeep(pre.concat(next));
  }, [])
}

const analysisSingleFile = async (filepath: string) => {

  // 循环依赖
  if (touchedFiles.has(filepath)) {
    return [];
  }

  touchedFiles.add(filepath);

  const dirPath = path.dirname(filepath);

  const fileJsonObj = safeParseJson(await promisify(fs.readFile)(filepath, 'utf-8'));

  const appendPath = getAppendResource(fileJsonObj);

  const appendResource: string[] = flattenDeep(appendPath.length === 0 ? [] : await (
    Promise.all(appendPath.map(p => analysisSingleFile(path.resolve(dirPath, p))))
  ));

  return appendResource.concat(Object.keys(ANALYSIS_FIELD_PATH)
    .reduce((preResult: string[], curPickPath: string) => {

      const extraDesc: string | symbol = ANALYSIS_FIELD_PATH[curPickPath];

      const isArrayPath = extraDesc !== useKeyPathDirect;

      const result: string | string[] = isArrayPath
        ? get(fileJsonObj, curPickPath, []).filter((i: any) => i[extraDesc]).map((i: any) => i[extraDesc])
        : get(fileJsonObj, curPickPath)

      const skip = typeof result === 'undefined' || result.length === 0;

      const rawPath2AbsolutePath = (p: string) => isURL(p) ? p : path.resolve(dirPath, p);

      return skip ? preResult : flattenDeep(preResult.concat(
        isArrayPath
          ? (result as string[]).map((p) =>rawPath2AbsolutePath(p))
          : [rawPath2AbsolutePath(result as string)]
      ))
    }, []));
}

const replaceAbsolutePath2relative = (str: string) => {
  return isURL(str) ? str : path.relative(execBasePath, str);
}

export const validateMeta = async () => {
  const metaJSON = safeParseJson(await promisify(fs.readFile)(metaFilePath, 'utf-8')) || {};

  const webAssets: string[] = metaJSON["web-assets"];

  const notExists: string[] = [];

  for (const assetPath of webAssets) {
    if (isURL(assetPath)) {
      continue;
    }
    if (!await promisify(fs.exists)(assetPath)) {
      notExists.push(assetPath)
    }
  }

  if (notExists.length > 0) {
    throw Error(`assets not exist:
      \t${notExists.join('\n\t')}
    `)
  }
  return true;
}


// main
export const buildWebAssetsMeta = async () => {
  const result = uniq(flattenDeep( await Promise.all(ANALYSIS_ENTRY_LIST.map(filePath => analysisSingleFile(filePath)))))
    .map(p => replaceAbsolutePath2relative(p));

  const preFileContent = await (async () => {
    try {
      const fileStr = await promisify(fs.readFile)(metaFilePath, 'utf-8');
      return safeParseJson(fileStr);
    } catch {
      return {};
    }
  })();

  await promisify(fs.writeFile)(metaFilePath, JSON.stringify({
    ...preFileContent,
    "web-assets": result
  }, null, 2))
}
