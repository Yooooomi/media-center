import { Constructor } from "ts-morph";

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
    value: V,
  ) {
    const built = new this(value);
    built.validate();
    return built;
  }

  toString() {
    return this.value.toString();
  }
}
