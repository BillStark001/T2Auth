export type LanguageResource = {
  [key: string]: string | string[] | LanguageResource;
};

export type CompiledLaguageResource = {
  [key: string]: string | CompiledLaguageResource;
};

const fetchElement = <T extends object>(obj: T, keys: string[]): T => {
  for (const key of keys){
    let obj2 = (obj as unknown as Record<string, T>)[key] as T;
    if (obj2 == undefined){
      obj2 = {} as T;
      (obj as unknown as Record<string, T>)[key] = obj2;
    }
    obj = obj2;
  }
  return obj;
};

export const compileLanguageResource = (
  res: LanguageResource,
  order: readonly string[],
) => {
  const resCache: { [lang: string]: CompiledLaguageResource } = {};
  for (const lang of order)
    resCache[lang] = {};
  const stack: [LanguageResource, string[]][] = [[res, []]];
  while (stack.length > 0) {
    const [cur, path] = stack.pop()!;
    for (const key in cur) {
      const value = cur[key];
      if (typeof value === 'string') {
        // if value is string, then set in every language
        for (const lang of order)
          fetchElement(resCache[lang], path)[key] = value;
      } else if (Array.isArray(value)) {
        // if value is string array, set per language
        for (let i = 0; i < order.length; ++i) {
          const lang = order[i];
          const valueLang = value[i];
          if (valueLang != undefined)
            fetchElement(resCache[lang], path)[key] = valueLang;
        }
      } else {
        // if value is object, push to stack for the next round
        stack.push([value, [...path, key]]);
      }
    }
  }
  return resCache;
};