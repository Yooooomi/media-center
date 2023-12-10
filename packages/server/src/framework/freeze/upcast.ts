import {
  ShapeClass,
  ShapeParameter,
  deserializeShape,
  serializeShape,
} from "../shape";

type UpcastManifest = Record<string, (previous: any) => Promise<any>>;

class CannotUpcastError extends Error {
  constructor(version: number) {
    super(`Cannot upcast from version ${version} to version ${version + 1}`);
  }
}

type StoredUpcastSerialized = {
  data: any;
  version: number | undefined;
};

export class UpcastSerializer<T extends ShapeParameter> {
  constructor(
    private readonly ctor: T,
    private readonly upcastManifest: UpcastManifest
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

  private upcast(data: any, fromVersion: number): any {
    if (fromVersion === this.latestVersion) {
      return data;
    }
    const key = `${fromVersion}to${fromVersion + 1}`;
    const upcaster = this.upcastManifest[key];
    if (!upcaster) {
      throw new CannotUpcastError(fromVersion);
    }
    return this.upcast(upcaster(data), fromVersion + 1);
  }

  deserialize(data: StoredUpcastSerialized) {
    const { version } = data;
    if (version === this.latestVersion) {
      return data.data;
    }
    return deserializeShape(this.ctor, this.upcast(data.data, version ?? 0));
  }
}
