import { Constructor } from "../types/utils";
import {
  DetailsInput,
  LiteralInstance,
  ManifestToInput,
  Multiple,
  Shape,
  ShapeParameter,
} from "./shape";

export class InternalQuery<N, R> {
  private a!: N;
  private b!: R;

  constructor(
    public readonly needing: N | undefined,
    public readonly returning: R | undefined,
    public readonly data: DetailsInput<N>
  ) {}
}

export type InternalQueryConstructor<N, R> = Constructor<
  InternalQuery<N, R>
> & {
  needing?: N;
  returning?: R;
};

export function Query<
  N extends ShapeParameter | undefined = undefined,
  R extends ShapeParameter | undefined = undefined
>(description: { needing?: N; returning?: R }) {
  return class extends InternalQuery<N, R> {
    static needing = description.needing;
    static returning = description.returning;

    constructor(data: DetailsInput<N>) {
      super(description.needing, description.returning, data as any);
    }
  };
}

export type QueryReturnType<Q> = Q extends InternalQuery<any, infer R>
  ? R extends undefined
    ? void
    : LiteralInstance<R>
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
