import { AtLeastId, Serializer } from "../serializer";
import { Serializable, SerializableConstructor } from "../types";

class CannotUpcastError extends Error {
  constructor(version: number) {
    super(`Cannot upcast from version ${version} to version ${version + 1}`);
  }
}

export class UpcastSerializer<
  T extends Serializable & AtLeastId,
> extends Serializer<T> {
  constructor(
    private readonly ctor: SerializableConstructor<T>,
    private readonly upcastManifest: UpcastManifest<any>,
  ) {
    super();
  }

  public get version() {
    return Object.keys(this.upcastManifest).length;
  }

  async serialize(shape: T) {
    return shape.serialize();
  }

  private async upcast(data: any, fromVersion: number): Promise<any> {
    if (fromVersion === this.version) {
      return data;
    }
    const upcaster = this.upcastManifest.manifest[fromVersion];
    if (!upcaster) {
      throw new CannotUpcastError(fromVersion);
    }
    return this.upcast(await upcaster.upcast(data), fromVersion + 1);
  }

  async deserialize(data: any, version: number) {
    if (version === this.version) {
      return this.ctor.deserialize(data);
    }
    return this.ctor.deserialize(await this.upcast(data.data, version ?? 0));
  }
}

type NotFrozen =
  "Last frozen type is not equal to last serialized type, you should consider running freeze";
type Equals<X extends { serialize: any }, Y> = (() => ReturnType<
  X["serialize"]
>) extends () => Y
  ? (() => Y) extends () => ReturnType<X["serialize"]>
    ? true
    : NotFrozen
  : NotFrozen;

type LastFromArray<T extends any[]> = T extends [...any[], infer Last]
  ? Last
  : never;

export type EnsureFrozen<
  A extends Serializable,
  Versions extends any[],
> = Equals<A, LastFromArray<Versions>>;

export abstract class VersionUpcaster<From, To> {
  abstract upcast(from: From): To;
  abstract downcast(to: To): From;
}

export abstract class UpcastManifest<
  T extends any[],
  ShouldCompile extends true = true,
> {
  abstract get manifest(): VersionUpcaster<T[number], T[number]>[];
}
