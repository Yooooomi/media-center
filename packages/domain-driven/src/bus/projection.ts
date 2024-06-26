import { Constructor } from "../serialization";
import { BaseEvent } from "./eventBus/event";
import { EventBus } from "./eventBus/eventBus";

export class Projection {
  registry = new Map<
    Constructor<BaseEvent<any>>,
    ((event: BaseEvent<any>) => Promise<void>)[]
  >();

  static on<T extends BaseEvent<any>>(event: Constructor<T>) {
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
