import { Poll } from "./poll";

export class InMemoryPoll extends Poll {
  poll() {
    const doPoll = async () => {
      try {
        await this.polling.execute();
      } catch (e) {
        console.log("Polling failed", e);
      }
    };

    const id = setInterval(doPoll, this.polling.intervalMs);
    return () => clearInterval(id);
  }
}
