import * as JSON5 from 'json5'

export function safeParseJson<T = any>(jsonStr: string, defaultValue?: T): T | undefined {
  try {
    return JSON5.parse(jsonStr);
  } catch (err) {
    console.warn('json parse failed with:', jsonStr);
    console.warn(err);
  }
  return defaultValue;
}

