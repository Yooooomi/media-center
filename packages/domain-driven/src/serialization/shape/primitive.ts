import {
  Definition,
  DefinitionParameter,
  DefinitionRuntime,
  DefinitionSerialized,
} from "./definitions/definition";
import { ShorthandToLonghand, Shorthands } from "./definitions/shorthands";
import { shorthandToLonghand } from "./shorthandToLonghand";
import { AbstractConstructor, Constructor, Expand } from "./types";

export type IsPrimitiveConstructor<D extends Shorthands | Definition> =
  Constructor<{
    serialize: () => Expand<DefinitionSerialized<ShorthandToLonghand<D>>>;
  }> & {
    deserialize: ShorthandToLonghand<D>["deserialize"];
    isPrimitive: true;
  };

type NonConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new () => any ? never : P;
}[keyof T];
type NonConstructor<T> = Pick<T, NonConstructorKeys<T>>;

class DefaultPrimitiveBaseClass {}

export const Primitive = <
  const D extends Shorthands | Definition,
  B extends Constructor<{}> | AbstractConstructor<{}>
>(
  definition: D,
  base: B = DefaultPrimitiveBaseClass as B
) => {
  const longhand = shorthandToLonghand(definition);

  class Intermediate extends base {
    static isPrimitive = true as const;

    public value: DefinitionRuntime<ShorthandToLonghand<D>>;

    constructor(...args: any[]) {
      const converted = longhand.paramToRuntime(args[0]);
      super();
      this.value = converted;
    }

    static deserialize<T extends IsPrimitiveConstructor<D>>(
      this: T,
      serialized: Expand<DefinitionSerialized<ShorthandToLonghand<D>>>
    ) {
      return new this(longhand.deserialize(serialized as any)) as any;
    }

    serialize(): Expand<DefinitionSerialized<ShorthandToLonghand<D>>> {
      return longhand.serialize(this.value) as any;
    }
  }

  return Intermediate as unknown as {
    isPrimitive: true;
    new (data: Expand<DefinitionParameter<ShorthandToLonghand<D>>>): {
      value: DefinitionRuntime<ShorthandToLonghand<D>>;
    } & {
      serialize(): Expand<DefinitionSerialized<ShorthandToLonghand<D>>>;
    } & InstanceType<B>;
    deserialize<T extends IsPrimitiveConstructor<D>>(
      this: T,
      serialized: Expand<DefinitionSerialized<ShorthandToLonghand<D>>>
    ): InstanceType<T>;
  } & Omit<B, "">;
};
