import {
  LiteralInstance,
  LiteralInstanceOrVoid,
  ShapeParameter,
} from "../../serialization/shape";
import { Constructor } from "../../types";

export class InternalQuery<
  N extends ShapeParameter | undefined,
  R extends ShapeParameter | undefined
> {
  constructor(
    public readonly needing: N | undefined,
    public readonly returning: R | undefined,
    public readonly data: LiteralInstanceOrVoid<N>
  ) {}
}

export function Query<
  N extends ShapeParameter | undefined = undefined,
  R extends ShapeParameter | undefined = undefined
>(description: { needing?: N; returning?: R }) {
  return class extends InternalQuery<N, R> {
    static needing = description.needing;
    static returning = description.returning;

    constructor(
      data: N extends undefined ? void : LiteralInstance<NonNullable<N>>
    ) {
      super(description.needing, description.returning, data);
    }
  };
}

export type InternalQueryConstructor<
  N extends ShapeParameter | undefined,
  R extends ShapeParameter | undefined
> = Constructor<InternalQuery<N, R>> & {
  needing?: N;
  returning?: R;
};

export type QueryReturnType<Q> = Q extends InternalQuery<any, infer R>
  ? R extends undefined
    ? void
    : LiteralInstanceOrVoid<R>
  : never;

export class InternalQueryHandler<Q extends InternalQuery<any, any>> {
  public execute(query: Q): Promise<QueryReturnType<Q>> {
    throw new Error("Not implemented");
  }
}

export function QueryHandler<Q extends InternalQuery<any, any>>(
  query: Constructor<Q>
) {
  return InternalQueryHandler<Q>;
}
