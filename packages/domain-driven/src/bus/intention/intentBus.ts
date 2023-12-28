import {
  BaseIntent,
  BaseIntentConstructor,
  BaseIntentHandler,
  Definition,
} from "../..";

export abstract class IntentBus {
  abstract register(intentHandler: BaseIntentHandler<any>): void;
  abstract execute(intent: BaseIntent<Definition, Definition>): Promise<any>;
  abstract get(name: string): BaseIntentConstructor<any>;
}
