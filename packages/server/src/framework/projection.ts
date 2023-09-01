import { Constructor } from "../types/utils";
import { Event } from "./event/event";
import { EventBus } from "./event/eventBus";

export class Projection {
  registry = new Map<
    Constructor<Event<any>>,
    ((event: Event<any>) => Promise<void>)[]
  >();

  static on<T extends Event<any>>(event: Constructor<T>) {
    return <P extends Projection>(
      target: P,
      key: string,
      descriptor: TypedPropertyDescriptor<(event: T) => Promise<void>>
    ) => {
      const exists = target.registry.get(event) ?? [];
      exists.push(descriptor.value as any);
      target.registry.set(event, exists);
    };
  }

  listen(eventBus: EventBus) {
    for (const [event, handlers] of this.registry.entries()) {
      for (const handler of handlers) {
        eventBus.on(event, handler);
      }
    }
  }
}
