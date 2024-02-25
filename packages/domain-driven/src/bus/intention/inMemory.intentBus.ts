import { TimeMeasurer, debounceOverflow } from "@media-center/algorithm";
import { InfrastructureError } from "../../error";
import { Definition } from "../../serialization";
import { BaseEvent } from "../eventBus/event";
import { EventBus } from "../eventBus/eventBus";
import { useLog } from "../../useLog";
import { Id } from "../../id";
import { BaseIntent, BaseIntentConstructor, BaseIntentHandler } from "./intent";
import { IntentBus, IntentBusStateItem } from "./intentBus";

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
  private readonly stateListeners: ((
    state: Record<string, IntentBusStateItem>,
  ) => void)[] = [];
  private readonly state: Record<string, IntentBusStateItem> = {};

  static logger = useLog(InMemoryIntentionBus.name);

  private triggerStateListeners() {
    if (this.stateListeners.length === 0) {
      return;
    }
    const editableState = { ...this.state };
    this.stateListeners.forEach((fn) => fn(editableState));
  }

  private addItemToState(item: IntentBusStateItem) {
    const requestId = Id.generate().toString();
    this.state[requestId] = item;
    this.triggerStateListeners();
    return requestId;
  }

  private deleteItemFromState(requestId: string) {
    delete this.state[requestId];
    this.triggerStateListeners();
  }

  async execute(intent: BaseIntent<Definition, Definition>) {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }
    const requestId = this.addItemToState({
      type: "instant",
      intentHandlerName: handler.constructor.name,
      intent,
    });
    const result = await handler.execute(intent);
    this.deleteItemFromState(requestId);
    return result;
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

  executeAndReact(
    bus: EventBus,
    intent: BaseIntent<Definition, Definition>,
    handle: (result: any, timeMs: number) => void,
  ) {
    const handler = this.handlerRegistry[intent.constructor.name];
    if (!handler) {
      throw new NoHandlerFound(intent.constructor.name);
    }

    const requestId = this.addItemToState({
      type: "reactive",
      intentHandlerName: handler.constructor.name,
      intent: intent,
    });

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
      this.deleteItemFromState(requestId);
    };
  }

  listenToState(handler: (state: Record<string, IntentBusStateItem>) => void) {
    this.stateListeners.push(handler);
    this.triggerStateListeners();
    return () => {
      const index = this.stateListeners.indexOf(handler);
      if (index < 0) {
        InMemoryIntentionBus.logger.warn(
          "State listener not found when unsubscribing",
        );
        return;
      }
      this.stateListeners.splice(index, 1);
    };
  }
}
