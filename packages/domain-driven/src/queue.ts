interface QueueItem<T> {
  fn: () => Promise<T>;
  onResolve: (data: T) => void;
  onError: (error: Error) => void;
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class PromiseQueue {
  private q: QueueItem<any>[] = [];

  constructor(private readonly cooldown: number) {}

  execQueue = async () => {
    while (this.q.length > 0) {
      const item = this.q[0];
      if (!item) {
        continue;
      }
      try {
        const data = await item.fn();
        item.onResolve(data);
      } catch (e) {
        item.onError(e as any);
      }
      if (this.cooldown > 0) {
        await wait(this.cooldown);
      }
      this.q.shift();
    }
  };

  queue = <T>(fn: () => Promise<T>) => {
    return new Promise<T>((res, rej) => {
      this.q.push({
        fn,
        onResolve: res,
        onError: rej,
      });
      if (this.q.length === 1) {
        this.execQueue().catch(console.error);
      }
    });
  };
}
