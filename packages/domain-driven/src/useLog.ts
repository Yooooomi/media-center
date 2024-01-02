export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export function useLog(name: any): Logger {
  return {
    debug: (...args: any[]) => console.debug(`DEBUG [${name}]:`, ...args),
    info: (...args: any[]) => console.info(`INFO [${name}]:`, ...args),
    warn: (...args: any[]) => console.warn(`WARN [${name}]:`, ...args),
    error: (...args: any[]) => console.error(`ERROR [${name}]:`, ...args),
  };
}
