import { Serializer } from "../serializer";
import { serializeShape, deserializeShape } from "./shape";
import { ShapeParameter } from "./shapeParameter";
import { LiteralInstance } from "./types";

export class ShapeSerializer<T extends ShapeParameter> extends Serializer<
  LiteralInstance<T>,
  any
> {
  constructor(private readonly ctor: T) {
    super();
  }

  public get version() {
    return 1;
  }

  public getIdFromModel(model: any) {
    return model.id;
  }

  protected async serialize(model: any) {
    return { data: serializeShape(this.ctor, model) };
  }

  protected async deserialize(serialized: any) {
    return deserializeShape(this.ctor, serialized.data);
  }
}
