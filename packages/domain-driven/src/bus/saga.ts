import { maxConcurrent } from "@media-center/algorithm";
import { Constructor } from "../serialization";
import { PromiseOr } from "../serialization/types";
import { BaseEvent } from "./eventBus/event";
import { EventBus } from "./eventBus/eventBus";
import { Job, JobRegistry } from "./jobRegistry";

interface HandlerOptions {
  maxConcurrent?: number;
}

export class Saga {
  static registry: Map<
    Constructor<BaseEvent<any>>,
    ((event: BaseEvent<any>) => PromiseOr<void>)[]
  >;

  constructor(private readonly jobRegistry: JobRegistry) {}

  static registerHandler(
    event: Constructor<BaseEvent<any>>,
    handler: (event: BaseEvent<any>) => void,
  ) {
    if (!this.registry) {
      this.registry = new Map<
        Constructor<BaseEvent<any>>,
        ((event: BaseEvent<any>) => PromiseOr<void>)[]
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
        await Promise.all(
          handlers.map(async (handler) => {
            const unregister = this.jobRegistry.register(
              new Job({
                namespace: ctor.name,
                name: handler.name,
                data: JSON.stringify(ev.serialize()),
              }),
            );
            await handler.call(this, ev);
            unregister();
          }),
        );
      });
    }
  }
}
