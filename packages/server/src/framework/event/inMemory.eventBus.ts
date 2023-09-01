import { Constructor } from "../../types/utils";
import { useLog } from "../useLog";
import { Event } from "./event";
import { EventBus } from "./eventBus";

export class InMemoryEventBus extends EventBus {
  private registry = new Map<string, ((event: Event<any>) => void)[]>();

  publish(event: Event<any>): void {
    const logger = useLog(InMemoryEventBus.name);
    logger.debug(`Publishing event ${event.constructor.name}`);
    const exists = this.registry.get(event.constructor.name);
    if (!exists) {
      return;
    }
    exists.forEach((handler) => handler(event));
  }

  on<T extends Event<any>>(
    event: Constructor<T>,
    handler: (event: T) => void
  ): void {
    const exists = this.registry.get(event.name) ?? [];
    exists.push(handler as any);
    this.registry.set(event.name, exists);
  }
}
