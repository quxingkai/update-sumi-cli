import * as JSON5 from 'json5'

export function safeParseJson<T = any>(jsonStr: string, defaultValue?: T): T | undefined {
  try {
    return JSON5.parse(jsonStr);
  } catch (err) {
  }
  return defaultValue;
}

