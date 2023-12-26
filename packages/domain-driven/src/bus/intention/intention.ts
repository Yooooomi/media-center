import {
  Constructor,
  Definition,
  DefinitionParameter,
  DefinitionRuntime,
  DefinitionSerialized,
  DictShorthand,
  Expand,
  ShorthandToLonghand,
  Shorthands,
  shorthandToLonghand,
} from "../../serialization";

export abstract class BaseIntention<
  N extends Definition,
  R extends Definition
> {
  n!: N;
  r!: R;

  abstract serialize(): DefinitionSerialized<N>;
}
export abstract class BaseIntentionHandler<
  I extends BaseIntention<Definition, Definition>
> {
  abstract execute(
    intention: I
  ): {} extends DefinitionParameter<BaseIntentionReturning<I>>
    ? Promise<void>
    : Promise<Expand<DefinitionParameter<BaseIntentionReturning<I>>>>;
}

type BaseIntentionReturning<T extends BaseIntention<Definition, Definition>> =
  T extends BaseIntention<Definition, infer R> ? R : never;

export type IntentionNeed<I extends BaseIntention<any, any>> =
  I extends BaseIntention<infer N, any>
    ? Expand<DefinitionParameter<N>>
    : never;
export type IntentionReturn<I extends BaseIntention<any, any>> =
  I extends BaseIntention<any, infer R> ? Expand<DefinitionRuntime<R>> : never;

export function Intention<
  D extends Definition | Shorthands = {},
  R extends Definition | Shorthands = {}
>(needing: D = {} as D, returning: R = {} as R) {
  return class Base extends BaseIntention<
    ShorthandToLonghand<D>,
    ShorthandToLonghand<R>
  > {
    static needing = shorthandToLonghand(needing);
    static returning = shorthandToLonghand(returning);

    constructor(
      public readonly data: {} extends D
        ? void
        : DefinitionParameter<ShorthandToLonghand<D>>
    ) {
      super();
    }

    serialize() {
      return Base.needing.serialize(this.data);
    }
  };
}
export type IntentionConstructor1<
  D extends DictShorthand,
  R extends DictShorthand
> = ReturnType<typeof Intention<D, R>>;

export type IntentionConstructor<
  D extends DictShorthand,
  R extends DictShorthand
> = Constructor<
  BaseIntention<ShorthandToLonghand<D>, ShorthandToLonghand<R>>
> & {
  needing: ShorthandToLonghand<D>;
  returning: ShorthandToLonghand<D>;
};

export function IntentionHandler<
  I extends BaseIntention<Definition, Definition>
>(intention: Constructor<I>) {
  abstract class A extends BaseIntentionHandler<I> {}
  return A;
}
