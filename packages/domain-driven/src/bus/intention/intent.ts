import {
  AnyDefinition,
  AnyShorthand,
  Constructor,
  DefinitionParameter,
  Shape,
  ShapeConstructor,
  ShorthandToLonghand,
  shorthandToLonghand,
} from "../../serialization";
import {
  NothingConfiguration,
  Nothing,
} from "../../serialization/shape/definitions/nothing";

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

export type BaseIntentConstructor<I extends BaseIntent<any>> =
  Constructor<I> & {
    needing: ShorthandToLonghand<I["n"]>;
    returning: ShorthandToLonghand<I["r"]>;
  };

export abstract class BaseIntentHandler<I extends BaseIntent<any>> {
  intent!: BaseIntentConstructor<I>;

  abstract execute(
    intent: I
  ): Promise<
    DefinitionParameter<ShorthandToLonghand<I["r"]>> extends undefined
      ? void
      : DefinitionParameter<ShorthandToLonghand<I["r"]>>
  >;
}

export function IntentHandler<const I extends BaseIntent<any, any>>(
  intent: BaseIntentConstructor<I>
) {
  abstract class Handler extends BaseIntentHandler<I> {
    public intent = intent;
  }

  return Handler;
}
