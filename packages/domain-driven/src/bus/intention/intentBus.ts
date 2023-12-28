import {
  BaseIntent,
  BaseIntentConstructor,
  BaseIntentHandler,
  Definition,
  EventBus,
} from "../..";

export abstract class IntentBus {
  abstract register(intentHandler: BaseIntentHandler<any, any>): void;
  abstract execute(intent: BaseIntent<Definition, Definition>): Promise<any>;
  abstract executeAndReact(
    bus: EventBus,
    intent: BaseIntent<Definition, Definition>,
    handler: (result: any) => void
  ): Promise<() => void>;
  abstract get(name: string): BaseIntentConstructor<any>;
}
