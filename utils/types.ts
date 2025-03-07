export const withKeysMapped = <T extends object, M extends Partial<{ [key in keyof T]: Exclude<string, keyof T> }>>(before: T, mapping: M): WithKeysMapped<T, M> => {
  const after = {} as WithKeysMapped<T, M>;
  for (const k of Object.keys(before)) {
    const key = k as keyof T;
    const value = before[key];
    if (key in mapping) {
      const keyAfter = mapping[key];
      if (before[keyAfter as unknown as keyof T]) {
        continue;
      }
      after[keyAfter] = value as unknown as WithKeysMapped<T, M>[typeof keyAfter];
    } else {
      after[key as unknown as keyof WithKeysMapped<T, M>] = value as unknown as WithKeysMapped<T, M>[keyof WithKeysMapped<T, M>];
    }
  }
  return after;
};
