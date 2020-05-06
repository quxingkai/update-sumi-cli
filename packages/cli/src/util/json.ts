export function safeParseJson<T = any>(jsonStr: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn('json parse failed with:', jsonStr);
    console.warn(err);
  }
  return defaultValue;
}
