import { Constructor } from "../../types";
import { ShapeClass } from "./shape";
import { ShapeConstructorParameter } from "./shapeParameter";
import { LiteralInstance } from "./types";

export function Literal<T extends ShapeConstructorParameter>(ctor: T) {
  class A extends ShapeClass<any> {
    constructor(public readonly value: LiteralInstance<T>) {
      const manifest = { __value: ctor };
      super(manifest);
    }

    static serialize(value: A) {
      return value.value;
    }

    static deserialize<C extends Constructor<any>>(this: C, value: T) {
      return new this(value);
    }
  }
  return A;
}
