import { Constructor } from "../types/utils";
import {
  AutoSerialize,
  AutoSerializeConstructor,
  ManifestToRecord,
} from "./shape";

export class InternalQuery<N, RO, RM> {
  constructor(
    public readonly needing: AutoSerializeConstructor<N> | undefined,
    public readonly returningMaybeOne: AutoSerializeConstructor<RO> | undefined,
    public readonly returningMany: AutoSerializeConstructor<RM> | undefined,
    public readonly data: N extends { manifest: infer K }
      ? ManifestToRecord<K>
      : any
  ) {}
}

export type InternalQueryConstructor<N, RO, RM> = Constructor<
  InternalQuery<N, RO, RM>
> & {
  needing?: AutoSerializeConstructor<N>;
  returningMaybeOne?: AutoSerializeConstructor<RO>;
  returningMany?: AutoSerializeConstructor<RM>;
};

export function Query<
  N extends AutoSerialize<any> = AutoSerialize<1>,
  RO extends AutoSerialize<any> = AutoSerialize<1>,
  RM extends AutoSerialize<any> = AutoSerialize<1>
>(description: {
  needing?: Constructor<N>;
  returningMaybeOne?: Constructor<RO>;
  returningMany?: Constructor<RM>;
}) {
  return class extends InternalQuery<N, RO, RM> {
    static needing = description.needing;
    static returningMaybeOne = description.returningMaybeOne;
    static returningMany = description.returningMany;

    constructor(
      data: N extends { manifest: infer K } ? ManifestToRecord<K> : void
    ) {
      super(
        description.needing as any,
        description.returningMaybeOne as any,
        description.returningMany as any,
        data
      );
    }
  };
}

export type QueryReturnType<Q> = Q extends InternalQuery<
  any,
  infer RO,
  infer RM
>
  ? RO extends AutoSerialize<1>
    ? RM extends AutoSerialize<1>
      ? void
      : RM[]
    : RO | undefined
  : never;

export abstract class InternalQueryHandler<
  Q extends InternalQuery<any, any, any>
> {
  public execute(query: Q): Promise<QueryReturnType<Q>> {
    throw new Error("Not implemented");
  }
}

export function QueryHandler<Q extends InternalQuery<any, any, any>>(
  query: Constructor<Q>
) {
  return InternalQueryHandler<Q>;
}
