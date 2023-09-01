import { Constructor } from "../types/utils";
import { v4 } from "uuid";
import { DomainError } from "./error";

class IncompatibleId extends DomainError {
  constructor(provided: any) {
    super(`Provided id ${provided} is not a valid id`);
  }
}

export class Id {
  constructor(protected readonly value: string) {}

  static generate<T extends Constructor<Id>>(this: T) {
    return new this(v4());
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
    return (
      other instanceof (this.constructor as Constructor<T>) &&
      this.value === other.value
    );
  }

  toString() {
    return this.value;
  }
}
