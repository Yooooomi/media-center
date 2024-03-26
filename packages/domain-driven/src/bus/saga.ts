import { maxConcurrent } from "@media-center/algorithm";
import { Constructor } from "../serialization";
import { BaseEvent } from "./eventBus/event";
import { EventBus } from "./eventBus/eventBus";
import { Job, JobRegistry } from "./jobRegistry";

interface HandlerOptions {
  maxConcurrent?: number;
}

export class Saga {
  static registry: Map<
    Constructor<BaseEvent<any>>,
    ((event: BaseEvent<any>) => void)[]
  >;

  constructor(private readonly jobRegistry: JobRegistry) {}

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

  static on<T extends Saga>(
    event: Constructor<BaseEvent<any>>,
    options?: HandlerOptions,
  ) {
    return (
      target: T,
      _propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      const ctor = target.constructor as typeof Saga;
      if (options?.maxConcurrent) {
        ctor.registerHandler(
          event,
          maxConcurrent(descriptor.value, options.maxConcurrent),
        );
      } else {
        ctor.registerHandler(event, descriptor.value);
      }
    };
  }

  listen<T extends Saga>(this: T, eventBus: EventBus) {
    const ctor = this.constructor as typeof Saga;
    for (const [event, handlers] of ctor.registry.entries()) {
      eventBus.on(event, async (ev) => {
        const unregister = this.jobRegistry.register(
          new Job({
            namespace: ctor.name,
            name: ev.constructor.name,
            data: JSON.stringify(ev.serialize()),
          }),
        );
        await Promise.all(handlers.map((handler) => handler.call(this, ev)));
        unregister();
      });
    }
  }
}
