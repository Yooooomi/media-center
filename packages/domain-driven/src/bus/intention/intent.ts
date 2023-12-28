import {
  AnyDefinition,
  AnyShorthand,
  Constructor,
  DefinitionParameter,
  DefinitionRuntime,
  Shape,
  ShapeConstructor,
  ShorthandToLonghand,
  shorthandToLonghand,
} from "../../serialization";
import {
  NothingConfiguration,
  Nothing,
} from "../../serialization/shape/definitions/nothing";
import { BaseEvent } from "../eventBus/event";

export function Intent<
  const N extends AnyDefinition | AnyShorthand = NothingConfiguration,
  const R extends AnyDefinition | AnyShorthand = NothingConfiguration
>(needing: N = Nothing() as N, returning: R = Nothing() as R) {
  const n = shorthandToLonghand(needing);
  const r = shorthandToLonghand(returning);
  return Shape(
    needing,
    class {
      static needing = n;
      static returning = r;

      n = n;
      r = r;
    }
  );
}

export type BaseIntent<
  N extends AnyDefinition | AnyShorthand = NothingConfiguration,
  R extends AnyDefinition | AnyShorthand = NothingConfiguration
> = InstanceType<ShapeConstructor<N>> & {
  n: N;
  r: R;
};

export type IntentNeeding<I extends BaseIntent<any, any>> = DefinitionRuntime<
  I["n"]
>;
export type IntentReturning<I extends BaseIntent<any, any>> = DefinitionRuntime<
  I["r"]
>;

export type BaseIntentConstructor<I extends BaseIntent<any>> =
  Constructor<I> & {
    needing: ShorthandToLonghand<I["n"]>;
    returning: ShorthandToLonghand<I["r"]>;
  };

export function IntentHandler<
  const I extends BaseIntent<any, any>,
  const E extends BaseEvent<any>
>(intent: BaseIntentConstructor<I>, reactOn?: Constructor<E>[]) {
  abstract class Handler {
    public intent = intent;
    public events = reactOn;

    public shouldReact(event: E, intent: I) {
      return !reactOn || reactOn.length === 0;
    }

    abstract execute(
      intent: I
    ): Promise<
      DefinitionParameter<ShorthandToLonghand<I["r"]>> extends undefined
        ? void
        : DefinitionParameter<ShorthandToLonghand<I["r"]>>
    >;
  }

  return Handler;
}

export type BaseIntentHandler<
  I extends BaseIntent<any, any>,
  E extends BaseEvent<any>
> = InstanceType<ReturnType<typeof IntentHandler<I, E>>>;
