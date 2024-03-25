import { TimeMeasurer, debounceOverflow } from "@media-center/algorithm";
import { InfrastructureError } from "../../error";
import { Definition } from "../../serialization";
import { BaseEvent } from "../eventBus/event";
import { EventBus } from "../eventBus/eventBus";
import { useLog } from "../../useLog";
import { Id } from "../../id";
import { Job, JobRegistry } from "../jobRegistry";
import { BaseIntent, BaseIntentConstructor, BaseIntentHandler } from "./intent";
import { IntentBus } from "./intentBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Command handler for intent "${name}" was not found`);
  }
}

export class InMemoryIntentionBus extends IntentBus {
  private readonly handlerRegistry: Record<
    string,
    BaseIntentHandler<any, any>
  > = {};
  private readonly intentRegistry: Record<string, BaseIntentConstructor<any>> =
    {};

  static logger = useLog(InMemoryIntentionBus.name);

  constructor(private readonly jobRegistry: JobRegistry) {
    super();
  }

  get(intentName: string) {
    const ctor = this.intentRegistry[intentName];
    if (!ctor) {
      throw new NoHandlerFound(intentName);
    }
    return ctor;
  }

  register(intentHandler: BaseIntentHandler<any, any>) {
    this.intentRegistry[intentHandler.intent.name] = intentHandler.intent;
    this.handlerRegistry[intentHandler.intent.name] = intentHandler;
  }

  async execute<T extends InMemoryIntentionBus>(
    this: T,
    intent: BaseIntent<Definition, Definition>,
  ) {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }
    const unregister = this.jobRegistry.register(
      new Job({
        namespace: this.constructor.name,
        name: intent.constructor.name,
        data: JSON.stringify(intent.serialize()),
      }),
    );
    const result = await handler.execute(intent);
    unregister();
    return result;
  }

  executeAndReact(
    bus: EventBus,
    intent: BaseIntent<Definition, Definition>,
    handle: (result: any, timeMs: number) => void,
  ) {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }

    const unregister = this.jobRegistry.register(
      new Job({
        namespace: this.constructor.name,
        name: intent.constructor.name,
        data: JSON.stringify(intent.serialize()),
      }),
    );

    async function react(event: BaseEvent<any>) {
      if (!handler) {
        return;
      }
      const handlerShouldReact = await handler?.shouldReact(event, intent);
      if (!handlerShouldReact) {
        return;
      }
      try {
        const measure = TimeMeasurer.fromNow();
        const result = await handler.execute(intent);
        handle(result, measure.calc());
      } catch (e) {
        // We dont send updates if query crashes
      }
    }

    const listeners = handler.events?.map((e) =>
      bus.on(e, debounceOverflow(react, 1000, 20)),
    );

    const measure = TimeMeasurer.fromNow();
    handler
      .execute(intent)
      .then((result) => {
        handle(result, measure.calc());
      })
      .catch(console.error);

    return () => {
      listeners?.forEach((unsubscribe) => unsubscribe());
      unregister();
    };
  }
}
