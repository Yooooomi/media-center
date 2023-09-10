import { Constructor } from "../types/utils";
import { AutoSerializeConstructor, ManifestToRecord } from "./shape";

export class InternalCommand<N, RO, RM> {
  constructor(
    public readonly needing: AutoSerializeConstructor<N> | undefined,
    public readonly returningMaybeOne: AutoSerializeConstructor<RO> | undefined,
    public readonly returningMany: AutoSerializeConstructor<RM> | undefined,
    public readonly data: N extends { manifest: infer K }
      ? ManifestToRecord<K>
      : any
  ) {}
}

export type InternalCommandConstructor<N, RO, RM> = Constructor<
  InternalCommand<N, RO, RM>
> & {
  needing?: AutoSerializeConstructor<N>;
  returningMaybeOne?: AutoSerializeConstructor<RO>;
  returningMany?: AutoSerializeConstructor<RM>;
};

export function Command<N = 1, RO = 1, RM = 1>(description: {
  needing?: Constructor<N>;
  returningMaybeOne?: Constructor<RO>;
  returningMany?: Constructor<RM>;
}) {
  return class extends InternalCommand<N, RO, RM> {
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

export type CommandReturnType<Q> = Q extends InternalCommand<
  any,
  infer RO,
  infer RM
>
  ? RO extends 1
    ? RM extends 1
      ? void
      : RM[]
    : RO | undefined
  : never;

export abstract class InternalCommandHandler<
  Q extends InternalCommand<any, any, any>
> {
  public execute(command: Q): Promise<CommandReturnType<Q>> {
    throw new Error("Not implemented");
  }
}

export function CommandHandler<Q extends InternalCommand<any, any, any>>(
  command: Constructor<Q>
) {
  return InternalCommandHandler<Q>;
}
