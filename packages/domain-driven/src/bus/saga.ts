import { Constructor } from "../serialization";
import { BaseEvent } from "./eventBus/event";
import { EventBus } from "./eventBus/eventBus";

export class Saga {
  static registry = new Map<
    Constructor<BaseEvent<any>>,
    ((event: BaseEvent<any>) => void)[]
  >();

  static on<T extends Saga>(event: Constructor<BaseEvent<any>>) {
    return (
      target: T,
      _propertyKey: string,
      descriptor: PropertyDescriptor
    ) => {
      const ctor = target.constructor as typeof Saga;
      const exists = ctor.registry.get(event) ?? [];
      exists.push(descriptor.value);
      ctor.registry.set(event, exists);
    };
  }

  listen(eventBus: EventBus) {
    const ctor = this.constructor as typeof Saga;
    for (const [event, handlers] of ctor.registry.entries()) {
      for (const handler of handlers) {
        eventBus.on(event, (ev) => {
          handler.bind(this)(ev);
        });
      }
    }
  }
}
