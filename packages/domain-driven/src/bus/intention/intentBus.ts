import {
  BaseIntent,
  BaseIntentConstructor,
  BaseIntentHandler,
  Definition,
  EventBus,
} from "../..";

export interface InstantIntentBusStateItem {
  type: "instant";
  intentHandlerName: string;
  intent: BaseIntent<Definition, Definition>;
}

export interface ReactiveIntentBusStateItem {
  type: "reactive";
  intentHandlerName: string;
  intent: BaseIntent<Definition, Definition>;
}

export type IntentBusStateItem =
  | InstantIntentBusStateItem
  | ReactiveIntentBusStateItem;

export abstract class IntentBus {
  abstract register(intentHandler: BaseIntentHandler<any, any>): void;
  abstract execute(intent: BaseIntent<Definition, Definition>): Promise<any>;
  abstract executeAndReact(
    bus: EventBus,
    intent: BaseIntent<Definition, Definition>,
    handler: (result: any, timeMs: number) => void,
  ): () => void;
  abstract get(name: string): BaseIntentConstructor<any>;
  abstract listenToState(
    handler: (state: Record<string, IntentBusStateItem>) => void,
  ): () => void;
}
