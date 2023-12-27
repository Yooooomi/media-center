import { Constructor } from "../../serialization";
import { useLog } from "../../useLog";
import { BaseEvent } from "./event";
import { EventBus } from "./eventBus";

export class InMemoryEventBus extends EventBus {
  private registry = new Map<string, ((event: BaseEvent<any>) => void)[]>();

  publish(event: BaseEvent<any>): void {
    const logger = useLog(InMemoryEventBus.name);
    logger.debug(`Publishing event ${event.getName()}`);
    const exists = this.registry.get(event.getName());
    if (!exists) {
      return;
    }
    exists.forEach((handler) => handler(event));
  }

  on<T extends BaseEvent<any>>(
    event: Constructor<T>,
    handler: (event: T) => void
  ) {
    const exists = this.registry.get(event.name) ?? [];
    exists.push(handler as any);
    this.registry.set(event.name, exists);
    return () => exists.splice(exists.indexOf(handler as any), 1);
  }

  onName(name: string, handler: (event: BaseEvent<any>) => void) {
    const exists = this.registry.get(name) ?? [];
    exists.push(handler as any);
    this.registry.set(name, exists);
    return () => exists.splice(exists.indexOf(handler as any), 1);
  }
}
