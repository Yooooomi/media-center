import { Constructor } from "../types/utils";
import {
  ShapeClass,
  DetailsInput,
  LiteralInstance,
  ManifestToInput,
  Multiple,
  Shape,
  ShapeDetails,
  ShapeParameter,
} from "./shape";

export class InternalCommand<N, R> {
  private a!: N;
  private b!: R;

  constructor(
    public readonly needing: N | undefined,
    public readonly returning: R | undefined,
    public readonly data: DetailsInput<N>
  ) {}
}

export type InternalCommandConstructor<N, R> = Constructor<
  InternalCommand<N, R>
> & {
  needing?: N;
  returning?: R;
};

export function Command<
  N extends ShapeParameter | undefined = undefined,
  R extends ShapeParameter | undefined = undefined
>(description: { needing?: N; returning?: R }) {
  return class extends InternalCommand<N, R> {
    static needing = description.needing;
    static returning = description.returning;

    constructor(data: DetailsInput<N>) {
      super(description.needing, description.returning, data as any);
    }
  };
}

export type CommandReturnType<Q> = Q extends InternalCommand<any, infer R>
  ? R extends undefined
    ? void
    : LiteralInstance<R>
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
