import { IsShapeConstructor } from "./mixins/objectShape";
import { Definition, DefinitionParameter } from "./definitions/definition";
import { IsPrimitiveConstructor } from "./mixins/primitive";
import { Shape } from "./mixins/shape";
import { Nothing, NothingConfiguration } from "./definitions/nothing";
import {
  AnyDefinition,
  AnyShorthand,
  ShorthandToLonghand,
} from "./definitions/shorthands";
import { shorthandToLonghand } from "./shorthandToLonghand";
import { Constructor } from "./types";

export function check<D extends Definition>(
  constructor: IsShapeConstructor<D>,
  instance: InstanceType<IsShapeConstructor<D>>
) {
  expect(instance).toEqual(constructor.deserialize(instance.serialize()));
}

export function checkPrimitive<D extends Definition>(
  constructor: IsPrimitiveConstructor<D>,
  instance: InstanceType<IsPrimitiveConstructor<D>>
) {
  expect(instance).toEqual(constructor.deserialize(instance.serialize()));
}
