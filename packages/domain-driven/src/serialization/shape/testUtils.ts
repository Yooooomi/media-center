import { IsShapeConstructor, Shape } from "./shape";
import { Definition } from "./definitions/definition";
import { IsPrimitiveConstructor } from "./primitive";

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
