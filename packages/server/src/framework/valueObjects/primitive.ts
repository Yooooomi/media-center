import { Constructor } from "../../types/utils";

type Stringifiable = { toString(): string };

export class Primitive<V extends Stringifiable> {
  constructor(protected readonly value: V) {}

  validate() {}

  equals(other: unknown) {
    const thisConstructor = this.constructor as Constructor<Primitive<V>>;
    return other instanceof thisConstructor && other.value === this.value;
  }

  static from<V extends Stringifiable, T extends Constructor<Primitive<V>>>(
    this: T,
    value: V
  ) {
    return new this(value);
  }

  toString() {
    return this.value.toString();
  }
}
