/* eslint-disable @typescript-eslint/no-explicit-any */

interface ThrottleOptions {
  /** @default 100 */
  interval?: number;
  /** @default false */
  trailing?: boolean;
}

interface ThrottleFunction {
  <T extends (...args: any[]) => any>(originFunction: T, interval?: number): (...args: Parameters<T>) => (ReturnType<T> | void);
  <T extends (...args: any[]) => any>(originFunction: T, options?: ThrottleOptions): (...args: Parameters<T>) => (ReturnType<T> | void);
}

export const throttle: ThrottleFunction = <T extends (...args: any[]) => any>(originFunction: T, config: number | ThrottleOptions = 100) => {
  const interval = typeof config === 'number' ? config : config.interval ?? 100;
  const trailing = typeof config === 'object' && config.trailing;

  let busy = false;
  let trail: (() => void) | null = null;

  const f = (...args: Parameters<T>): ReturnType<T> | void => {
    if (busy) {
      trail = () => originFunction(...args);
      return;
    }
    busy = true;
    setTimeout(() => {
      busy = false;
      if (trailing) {
        trail?.();
      }
    }, interval);
    return originFunction(...args);
  };

  return f;
};
