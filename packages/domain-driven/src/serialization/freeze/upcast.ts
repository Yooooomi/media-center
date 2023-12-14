import { Constructor } from "../../types";
import { ShapeClass, deserializeShape, serializeShape } from "../shape";

class CannotUpcastError extends Error {
  constructor(version: number) {
    super(`Cannot upcast from version ${version} to version ${version + 1}`);
  }
}

type StoredUpcastSerialized = {
  data: any;
  version: number | undefined;
};

export class UpcastSerializer<T extends ShapeClass<any>> {
  constructor(
    private readonly ctor: Constructor<T>,
    private readonly upcastManifest: UpcastManifest<any>
  ) {}

  private get latestVersion() {
    return Object.keys(this.upcastManifest).length;
  }

  serialize(shape: ShapeClass<any>) {
    return {
      version: this.latestVersion,
      data: serializeShape(this.ctor, shape),
    };
  }

  private async upcast(data: any, fromVersion: number): Promise<any> {
    if (fromVersion === this.latestVersion) {
      return data;
    }
    const upcaster = this.upcastManifest.manifest[fromVersion];
    if (!upcaster) {
      throw new CannotUpcastError(fromVersion);
    }
    return this.upcast(await upcaster.upcast(data), fromVersion + 1);
  }

  async deserialize(data: StoredUpcastSerialized) {
    const { version } = data;
    if (version === this.latestVersion) {
      return data.data;
    }
    return deserializeShape(
      this.ctor,
      await this.upcast(data.data, version ?? 0)
    );
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
  A extends ShapeClass<any>,
  Versions extends any[]
> = Equals<A, LastFromArray<Versions>>;

export abstract class VersionUpcaster<From, To> {
  abstract upcast(from: From): To;
}

export abstract class UpcastManifest<
  T extends any[],
  ShouldCompile extends true = true
> {
  abstract get manifest(): VersionUpcaster<T[number], T[number]>[];
}
