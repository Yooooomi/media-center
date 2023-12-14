import { Constructor } from "../../types";
import { ShapeDetails } from "./shapeDetails";
import { ShapeParameter } from "./shapeParameter";

export type LiteralInstanceOrVoid<T extends ShapeParameter | undefined> =
  T extends undefined ? void : LiteralInstance<NonNullable<T>>;

function a(params: LiteralInstanceOrVoid<undefined>) {}

a();

export type LiteralInstance<T extends ShapeParameter> =
  T extends Constructor<String>
    ? string
    : T extends Constructor<Number>
    ? number
    : T extends Constructor<Boolean>
    ? boolean
    : T extends Constructor<Date>
    ? Date
    : T extends Constructor<infer K>
    ? K
    : T extends ShapeDetails<infer L, any>
    ? L
    : T;
