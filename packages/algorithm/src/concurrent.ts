export class ConcurrentWrapper {
  private q: {
    handler: () => Promise<any>;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }[];

  private current = 0;

  constructor(private readonly maxConcurrentCalls: number) {
    this.q = [];
  }

  async queue<T>(func: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.q.push({ handler: func, resolve, reject });
      if (this.current === this.maxConcurrentCalls) {
        return;
      }
      this.processQueue().catch(console.error);
    });
  }

  private async processQueue() {
    const nextItemInQueue = this.q.shift();
    if (!nextItemInQueue) {
      return;
    }
    try {
      this.current += 1;
      const result = await nextItemInQueue.handler();
      nextItemInQueue.resolve(result);
    } catch (e) {
      nextItemInQueue.reject(e);
    }
    this.current -= 1;
    this.processQueue().catch(console.error);
  }
}

export const maxConcurrent = <T extends (...args: any[]) => Promise<any>>(
  handler: T,
  max: number,
): T => {
  const concurrent = new ConcurrentWrapper(max);
  return async function (this: any, ...args: any[]) {
    const result = await concurrent.queue(() => handler.call(this, ...args));
    return result;
  } as T;
};
