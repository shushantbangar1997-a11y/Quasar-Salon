const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const logger = {
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
};
