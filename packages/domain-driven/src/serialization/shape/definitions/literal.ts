import { Definition } from "./definition";

export type Literals = [
  [typeof String, string, string],
  [typeof Number, number, number],
  [typeof Boolean, boolean, boolean],
  [typeof Date, Date, string]
];
export type LiteralInput = Literals[number][0];
export type LiteralPrimitive = Literals[number][1];

export type LiteralRuntime<L extends LiteralInput> = Extract<
  Literals[number],
  [L, unknown, unknown]
>[1];

export type LiteralSerialized<L extends LiteralInput> = Extract<
  Literals[number],
  [L, unknown, unknown]
>[2];

export type LiteralShorthand = LiteralInput;
export type LiteralConfiguration = LiteralInput | LiteralShorthand;
export type LiteralDefinition<C extends LiteralConfiguration> = Definition<
  LiteralRuntime<C>,
  LiteralSerialized<C>
>;
export function Literal<C extends LiteralConfiguration>(
  configuration: C
): LiteralDefinition<C> {
  return {
    paramToRuntime: (param) => param,
    serialize: (runtime) => {
      if (configuration === Date) {
        return (runtime as Date).toISOString();
      }
      return runtime as any;
    },
    deserialize: (serialized) => {
      if (configuration === Date) {
        return new Date(serialized as string);
      }
      return serialized as any;
    },
  };
}
