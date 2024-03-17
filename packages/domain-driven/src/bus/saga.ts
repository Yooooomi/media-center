import { Constructor } from "../serialization";
import { BaseEvent } from "./eventBus/event";
import { EventBus } from "./eventBus/eventBus";

export class Saga {
  static registry: Map<
    Constructor<BaseEvent<any>>,
    ((event: BaseEvent<any>) => void)[]
  >;

  static registerHandler(
    event: Constructor<BaseEvent<any>>,
    handler: (event: BaseEvent<any>) => void,
  ) {
    if (!this.registry) {
      this.registry = new Map<
        Constructor<BaseEvent<any>>,
        ((event: BaseEvent<any>) => void)[]
      >();
    }
    const exists = this.registry.get(event) ?? [];
    exists.push(handler);
    this.registry.set(event, exists);
  }

  static on<T extends Saga>(event: Constructor<BaseEvent<any>>) {
    return (
      target: T,
      _propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      const ctor = target.constructor as typeof Saga;
      ctor.registerHandler(event, descriptor.value);
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
