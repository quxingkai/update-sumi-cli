import { get, uniq, flattenDeep } from 'lodash';
import { safeParseJson } from './json';
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


export const ANALYSIS_FIELD_PATH = {
  // vscode
  'contributes.iconThemes': 'path',
  'contributes.languages': 'configuration',
  'contributes.grammars': 'path',
  'contributes.themes': 'path',
  'contributes.snippets': 'path',
  'contributes.jsonValidation': 'url',

  // kaitian
  'kaitianContributes.browserMain': useKeyPathDirect,
  'kaitianContributes.workerMain': useKeyPathDirect,
}

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

const analysisSingleFile = (filepath: string) => {

  // 循环依赖
  if (touchedFiles.has(filepath)) {
    return [];
  }

  touchedFiles.add(filepath);

  const dirPath = path.dirname(filepath);

  const fileJsonObj = safeParseJson(fs.readFileSync(filepath, 'utf-8'));

  const appendPath = getAppendResource(fileJsonObj);

  const appendResource: string[] = flattenDeep(appendPath.length === 0 ? [] : (
    appendPath.map(p => analysisSingleFile(path.resolve(dirPath, p)))
  ));

  return appendResource.concat(Object.keys(ANALYSIS_FIELD_PATH)
    .reduce((preResult: string[], curPickPath: string) => {

      const extraDesc: string | symbol = ANALYSIS_FIELD_PATH[curPickPath];

      const isArrayPath = extraDesc !== useKeyPathDirect;

      const result: string | string[] = isArrayPath
        ? get(fileJsonObj, curPickPath, []).filter((i: any) => i[extraDesc]).map((i: any) => i[extraDesc])
        : get(fileJsonObj, curPickPath)

      const skip = typeof result === 'undefined' || result.length === 0;

      const rawPath2AbsosultPath = (p: string) => isURL(p) ? p : path.resolve(dirPath, p);

      return skip ? preResult : flattenDeep(preResult.concat(
        isArrayPath
          ? (result as string[]).map((p) =>rawPath2AbsosultPath(p))
          : [rawPath2AbsosultPath(result as string)]
      ))
    }, []));
}

const replaceAbsolutePath2relative = (str: string) => {
  return isURL(str) ? str : str.replace(execBasePath + '/', '');
}


// main
export const buildWebAssetsMeta = () => {
  const result = uniq(flattenDeep(ANALYSIS_ENTRY_LIST.map(filePath => analysisSingleFile(filePath))))
    .map(p => replaceAbsolutePath2relative(p));

  const preFileContent = (() => {
    try {
      const fileStr = fs.readFileSync(metaFilePath, 'utf-8');
      return safeParseJson(fileStr);
    } catch {
      return {};
    }
  })();

  fs.writeFileSync(metaFilePath, JSON.stringify({
    ...preFileContent,
    "web-assets": result
  }, null, 2));
}
