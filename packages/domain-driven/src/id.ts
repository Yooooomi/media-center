import { v4 } from "uuid";
import { DomainError } from "./error";
import { Constructor } from "./serialization/shape";
import { Primitive } from "./serialization/shape/primitive";

class IncompatibleId extends DomainError {
  constructor(provided: any) {
    super(`Provided id ${provided} is not a valid id`);
  }
}

export class Id extends Primitive(String) {
  static generate<T extends Constructor<Id>>(this: T): InstanceType<T> {
    return new this(v4()) as InstanceType<T>;
  }

  static from<T extends Id>(this: Constructor<T>, data: unknown) {
    if (typeof data !== "string") {
      throw new IncompatibleId(data);
    }

    const instance = new this(data);
    instance.validate();
    return instance;
  }

  validate() {}

  equals<T extends Id>(this: T, other: unknown) {
    return other instanceof Id && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}
