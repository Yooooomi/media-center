import { Id } from "./id";
import { IShape, Shape } from "./shape";

describe("Shape", () => {
  it("serializes and deserializes using class", () => {
    class MyId extends Id {}
    class MyShape extends Shape({
      id: MyId,
      value: String,
    }) {}
    MyShape.register();

    const id = MyId.generate();
    const instance = new MyShape({
      id,
      value: "my super string",
    });

    const serialized = instance.serialize();
    const deserialized = MyShape.deserialize(serialized.hash, serialized);

    expect(instance).toEqual(deserialized);
  });

  it("serializes and deserializes using IShape", () => {
    class MyId extends Id {}
    class MyShape extends Shape({
      id: MyId,
      value: String,
    }) {}
    MyShape.register();

    const id = MyId.generate();
    const instance = new MyShape({
      id,
      value: "my super string",
    });

    const serialized = instance.serialize();
    const deserialized = IShape.deserialize(serialized.hash, serialized);

    expect(instance).toEqual(deserialized);
  });

  it("serializes and deserializes nested shapes using class", () => {
    class MyId extends Id {}

    class MyChildShape extends Shape({
      a: String,
      b: Number,
    }) {}
    MyChildShape.register();

    class MyShape extends Shape({
      id: MyId,
      value: String,
      child: MyChildShape,
    }) {}
    MyShape.register();

    const id = MyId.generate();
    const instance = new MyShape({
      id,
      value: "my super string",
      child: new MyChildShape({
        a: "yo nested",
        b: 1,
      }),
    });

    const serialized = instance.serialize();
    const deserialized = MyShape.deserialize(serialized.hash, serialized);

    expect(instance).toEqual(deserialized);
  });

  it("serializes and deserializes nested shapes using IShape", () => {
    class MyId extends Id {}

    class MyChildShape extends Shape({
      a: String,
      b: Number,
    }) {}
    MyChildShape.register();

    class MyShape extends Shape({
      id: MyId,
      value: String,
      child: MyChildShape,
    }) {}
    MyShape.register();

    const id = MyId.generate();
    const instance = new MyShape({
      id,
      value: "my super string",
      child: new MyChildShape({
        a: "yo nested",
        b: 1,
      }),
    });

    const serialized = instance.serialize();
    const deserialized = IShape.deserialize(serialized.hash, serialized);

    expect(instance).toEqual(deserialized);
  });

  it("serializes and deserializes arrays using class", () => {
    class MyId extends Id {}

    class MyChildShape extends Shape({
      a: String,
      b: Number,
    }) {}
    MyChildShape.register();

    class MyShape extends Shape({
      id: MyId,
      value: String,
      values: [String],
      children: [MyChildShape],
    }) {}
    MyShape.register();

    const id = MyId.generate();
    const instance = new MyShape({
      id,
      value: "my super string",
      values: ["1", "2"],
      children: [
        new MyChildShape({ a: "1", b: 1 }),
        new MyChildShape({ a: "2", b: 2 }),
      ],
    });

    const serialized = instance.serialize();
    const deserialized = MyShape.deserialize(serialized.hash, serialized);

    expect(instance).toEqual(deserialized);
  });
});
