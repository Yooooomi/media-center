import { TimeMeasurer, debounceOverflow } from "@media-center/algorithm";
import { InfrastructureError } from "../../error";
import { Definition } from "../../serialization";
import { BaseEvent } from "../eventBus/event";
import { EventBus } from "../eventBus/eventBus";
import { BaseIntent, BaseIntentConstructor, BaseIntentHandler } from "./intent";
import { IntentBus } from "./intentBus";

class NoHandlerFound extends InfrastructureError {
  constructor(name: string) {
    super(`Command handler for command "${name}" was not found`);
  }
}

export class InMemoryIntentionBus extends IntentBus {
  private readonly handlerRegistry: Record<
    string,
    BaseIntentHandler<any, any>
  > = {};
  private readonly intentRegistry: Record<string, BaseIntentConstructor<any>> =
    {};

  async execute(intent: BaseIntent<Definition, Definition>) {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }
    return handler.execute(intent);
  }

  get(commandName: string) {
    const ctor = this.intentRegistry[commandName];
    if (!ctor) {
      throw new NoHandlerFound(commandName);
    }
    return ctor;
  }

  register(commandHandler: BaseIntentHandler<any, any>) {
    this.intentRegistry[commandHandler.intent.name] = commandHandler.intent;
    this.handlerRegistry[commandHandler.intent.name] = commandHandler;
  }

  async executeAndReact(
    bus: EventBus,
    intent: BaseIntent<Definition, Definition>,
    handle: (result: any, timeMs: number) => void,
  ): Promise<() => void> {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }

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
    const result = await handler.execute(intent);
    handle(result, measure.calc());

    return () => {
      listeners?.forEach((unsubscribe) => unsubscribe());
    };
  }
}
