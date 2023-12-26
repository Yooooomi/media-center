import {
  Constructor,
  Definition,
  DictConfiguration,
  DictShorthand,
} from "../..";
import {
  BaseIntention,
  BaseIntentionHandler,
  Intention,
  IntentionConstructor,
  IntentionHandler,
} from "./intention";

export abstract class IntentionBus {
  abstract register<C extends BaseIntention<Definition, Definition>>(
    command: Constructor<C>,
    commandHandler: BaseIntentionHandler<C>
  ): void;
  abstract execute<C extends BaseIntention<Definition, Definition>>(
    command: C
  ): Promise<any>;
  abstract get(
    name: string
  ): IntentionConstructor<DictShorthand, DictShorthand>;
}

class MyIntention extends Intention(
  {
    a: Number,
  },
  {
    b: String,
  }
) {}

class MyIntentionHandler extends IntentionHandler(MyIntention) {
  execute(intention: MyIntention): Promise<{ b: string }> {
    throw new Error("Method not implemented.");
  }
}
