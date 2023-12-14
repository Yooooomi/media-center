import { Constructor } from "../../types";
import { ShapeClass, ShapeClassConstructor } from "./shape";
import { ShapeDetails } from "./shapeDetails";

export type ShapeConstructorParameter =
  | Constructor<String>
  | Constructor<Number>
  | Constructor<Boolean>
  | Constructor<Date>;

export type ShapeParameter =
  | ShapeConstructorParameter
  | Constructor<ShapeClass<any>>
  | ShapeDetails<any, any>;

export function isShapeDetails(
  parameter: ShapeParameter
): parameter is ShapeDetails<any, any> {
  return (parameter as ShapeDetails<any, any>).isDetail === true;
}

export function isShapeConstructor(
  parameter: ShapeParameter
): parameter is ShapeClassConstructor<any> {
  return (parameter as any as { isShape: boolean }).isShape === true;
}

export function switchShapeParameter(
  parameter: ShapeParameter,
  {
    boolean,
    date,
    details,
    number,
    shape,
    string,
  }: {
    string: (constructor: Constructor<String>) => any;
    number: (constructor: Constructor<Number>) => any;
    boolean: (constructor: Constructor<Boolean>) => any;
    date: (constructor: Constructor<Date>) => any;
    details: (constructor: ShapeDetails<any, any>) => any;
    shape: (constructor: ShapeClassConstructor<any>) => any;
  }
) {
  if (parameter === String) {
    return string(parameter);
  }
  if (parameter === Number) {
    return number(parameter);
  }
  if (parameter === Boolean) {
    return boolean(parameter);
  }
  if (parameter === Date) {
    return date(parameter);
  }
  if (isShapeDetails(parameter)) {
    return details(parameter);
  }
  if (isShapeConstructor(parameter)) {
    return shape(parameter);
  }
}

export function switchShapeParameterAndValue(
  parameter: ShapeParameter,
  value: any,
  {
    boolean,
    date,
    details,
    number,
    shape,
    string,
  }: {
    string: (constructor: Constructor<String>, parameter: string) => any;
    number: (constructor: Constructor<Number>, parameter: number) => any;
    boolean: (constructor: Constructor<Boolean>, parameter: boolean) => any;
    date: (constructor: Constructor<Date>, parameter: Date) => any;
    details: (
      constructor: ShapeDetails<unknown, unknown>,
      parameter: any
    ) => any;
    shape: (
      constructor: ShapeClassConstructor<any>,
      parameter: ShapeClass<any>
    ) => any;
  }
) {
  return switchShapeParameter(parameter, {
    string: (_parameter) => string(_parameter, value),
    number: (_parameter) => number(_parameter, value),
    boolean: (_parameter) => boolean(_parameter, value),
    date: (_parameter) => date(_parameter, value),
    details: (_parameter) => details(_parameter, value),
    shape: (_parameter) => shape(_parameter, value),
  });
}
