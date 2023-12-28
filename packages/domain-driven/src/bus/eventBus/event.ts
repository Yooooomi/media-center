import { DictConfiguration, DictShorthand, Shape } from "../../serialization";
import { IsShapeConstructor } from "../../serialization/shape/mixins/objectShape";

class ParentEvent {
  getName<T extends ParentEvent>(this: T) {
    return this.constructor.name;
  }
}

export function Event<const T extends DictConfiguration | DictShorthand>(
  definition: T
) {
  return Shape(definition, ParentEvent);
}

export type BaseEvent<T extends DictConfiguration | DictShorthand> =
  InstanceType<IsShapeConstructor<T>> & ParentEvent;
