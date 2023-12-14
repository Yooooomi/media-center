import {
  LiteralInstance,
  LiteralInstanceOrVoid,
  ShapeParameter,
} from "../../serialization/shape";
import { Constructor } from "../../types";

export class InternalCommand<
  N extends ShapeParameter | undefined = undefined,
  R extends ShapeParameter | undefined = undefined
> {
  constructor(
    public readonly needing: N | undefined,
    public readonly returning: R | undefined,
    public readonly data: LiteralInstanceOrVoid<N>
  ) {}
}

export function Command<
  N extends ShapeParameter | undefined = undefined,
  R extends ShapeParameter | undefined = undefined
>(description: { needing?: N; returning?: R }) {
  return class extends InternalCommand<N, R> {
    static needing = description.needing;
    static returning = description.returning;

    constructor(
      data: N extends undefined ? void : LiteralInstance<NonNullable<N>>
    ) {
      super(description.needing, description.returning, data);
    }
  };
}

export type InternalCommandConstructor<
  N extends ShapeParameter | undefined = undefined,
  R extends ShapeParameter | undefined = undefined
> = Constructor<InternalCommand<N, R>> & {
  needing?: N;
  returning?: R;
};

export type CommandReturnType<Q> = Q extends InternalCommand<any, infer R>
  ? R extends undefined
    ? void
    : LiteralInstanceOrVoid<R>
  : never;

export class InternalCommandHandler<Q extends InternalCommand<any, any>> {
  public execute(command: Q): Promise<CommandReturnType<Q>> {
    throw new Error("Not implemented");
  }
}

export function CommandHandler<Q extends InternalCommand<any, any>>(
  command: Constructor<Q>
) {
  return InternalCommandHandler<Q>;
}
