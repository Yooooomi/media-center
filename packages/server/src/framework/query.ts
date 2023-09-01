import { Constructor, Instance } from "../types/utils";

export class Query<R> {
  private __markedAsUsed!: R;
}

export function FQuery<R extends Constructor<any> | [Constructor<any>]>(
  ctor: R
) {
  return Query<
    R extends Constructor<any>
      ? Instance<R>
      : R extends [Constructor<any>]
      ? Instance<R["0"]>[]
      : never
  >;
}

export type ReturnTypeOfQuery<Q extends Query<any>> = Q extends Query<infer R>
  ? R
  : never;
