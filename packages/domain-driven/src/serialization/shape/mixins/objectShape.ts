import {
  DefinitionParameter,
  DefinitionRuntime,
  DefinitionSerialized,
} from "../definitions/definition";
import { DictDefinition, DictShorthand } from "../definitions/dict";
import { ShorthandToLonghand } from "../definitions/shorthands";
import { shorthandToLonghand } from "../shorthandToLonghand";
import { Class, Constructor, Expand } from "../types";

export type IsShapeConstructor<D extends DictShorthand | DictDefinition<any>> =
  Constructor<{
    serialize: () => Expand<DefinitionSerialized<ShorthandToLonghand<D>>>;
  }> & {
    deserialize: ShorthandToLonghand<D>["deserialize"];
    isShape: true;
  };

class Base {}

export const ObjectShape = <
  const D extends DictShorthand | DictDefinition<any>,
  const B extends Class<{}>,
>(
  definition: D,
  base: B = Base as B,
) => {
  const longhand = shorthandToLonghand(definition);

  class Intermediate extends base {
    base = base;
    static isShape = true as const;

    constructor(data: DefinitionParameter<ShorthandToLonghand<D>>) {
      const converted = longhand.paramToRuntime(data);
      super(converted);
      Object.assign(this, converted);
    }

    static deserialize<T extends IsShapeConstructor<D>>(
      this: T,
      serialized: Expand<DefinitionSerialized<ShorthandToLonghand<D>>>,
    ) {
      return new this(longhand.deserialize(serialized as any));
    }

    static serialize<T extends IsShapeConstructor<D>>(
      this: T,
      runtime: InstanceType<T>,
    ) {
      return runtime.serialize();
    }

    serialize(): Expand<DefinitionSerialized<ShorthandToLonghand<D>>> {
      return longhand.serialize(this) as any;
    }
  }

  return Intermediate as unknown as {
    isShape: true;
    new (
      data: Expand<DefinitionParameter<ShorthandToLonghand<D>>>,
    ): DefinitionRuntime<ShorthandToLonghand<D>> & {
      serialize(): Expand<DefinitionSerialized<ShorthandToLonghand<D>>>;
    } & InstanceType<B>;
    deserialize<T extends Constructor<any>>(
      this: T,
      serialized: Expand<DefinitionSerialized<ShorthandToLonghand<D>>>,
    ): InstanceType<T>;
    serialize<T extends Constructor<any>>(
      this: T,
      runtime: InstanceType<T>,
    ): DefinitionSerialized<ShorthandToLonghand<D>>;
  } & Omit<B, "">;
};
