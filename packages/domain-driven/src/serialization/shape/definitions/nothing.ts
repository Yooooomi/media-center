import { Definition } from "./definition";

export type NothingConfiguration = undefined;
export type NothingShorthand = NothingConfiguration;
export type NothingDefinition<
  C extends NothingConfiguration = NothingConfiguration
> = Definition<C, C, C>;
export function Nothing<
  C extends NothingConfiguration
>(): NothingDefinition<C> {
  return {
    paramToRuntime: (param) => param,
    serialize: (runtime) => runtime,
    deserialize: (serialized) => serialized,
  };
}
