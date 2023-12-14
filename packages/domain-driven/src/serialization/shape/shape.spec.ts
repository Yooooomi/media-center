import { Literal } from "./literal";
import { ShapeClass, Shape } from "./shape";
import { Multiple, Enum, Optional, Dict, Either } from "./shapeDetails";

describe("New shape", () => {
  function check(a: ShapeClass<any>, log?: boolean) {
    const serialized = a.serialize();
    const deserialized = (a.constructor as any).deserialize(serialized);

    if (log) {
      console.log(a);
      console.log(deserialized);
    }

    expect(deserialized).toEqual(a);
  }

  it("basic shape", () => {
    class A extends Shape({
      a: Number,
    }) {}

    const a = new A({
      a: 1,
    });
    check(a);
  });

  it("nested shape", () => {
    class C extends Shape({
      d: Number,
    }) {
      keepThis() {}
    }

    class B extends Shape({
      c: C,
    }) {}

    class A extends Shape({
      b: B,
    }) {}

    const a = new A({
      b: new B({ c: new C({ d: 1 }) }),
    });

    check(a);
    a.b.c.keepThis();
  });

  it("array shape", () => {
    class A extends Shape({
      a: Multiple(Number),
    }) {}

    const a = new A({
      a: [1, 2],
    });

    check(a);
  });

  it("shape array shape", () => {
    class B extends Shape({
      a: Number,
    }) {}

    class A extends Shape({
      a: Multiple(B),
    }) {}

    const a = new A({
      a: [new B({ a: 1 })],
    });

    check(a);
  });

  it("enum shape", () => {
    class A extends Shape({
      a: Enum(["a", "b"]),
    }) {}

    const a = new A({
      a: "a",
    });

    check(a);
  });

  it("optional shape", () => {
    class A extends Shape({
      a: Optional(String),
    }) {}

    const a = new A({
      a: "hey",
    });
    const b = new A({
      a: undefined,
    });
    check(a);
    check(b);
  });

  it("optional shape shape", () => {
    class A extends Shape({
      a: String,
    }) {}

    class B extends Shape({
      a: Optional(A),
    }) {}

    const a = new B({
      a: new A({
        a: "hey",
      }),
    });
    const b = new B({
      a: undefined,
    });
    check(a);
    check(b);
  });

  it("literal shape", () => {
    class Id extends Literal(String) {
      keepThis() {}
    }

    class A extends Shape({
      a: Id,
    }) {}

    const a = new A({
      a: new Id("hey"),
    });

    check(a);
    a.a.keepThis();
  });

  it("dict shape", () => {
    class A extends Shape({
      a: Number,
      b: Dict({ nested: Number }),
    }) {}

    const a = new A({
      a: 1,
      b: {
        nested: 2,
      },
    });

    check(a);
    expect(a.b.nested).toEqual(2);
  });

  it("either shape", () => {
    class A extends Shape({
      a: Number,
    }) {}

    class B extends Shape({
      b: String,
    }) {}

    class C extends Shape({
      ab: Either(A, B),
    }) {}

    const a = new C({
      ab: new B({ b: "yaya" }),
    });
    check(a);
  });

  it("array of either", () => {
    class A extends Shape({
      a: Number,
    }) {}

    class B extends Shape({
      b: String,
    }) {}

    class C extends Shape({
      ab: Multiple(Either(A, B)),
    }) {}

    const a = new C({
      ab: [new B({ b: "yaya" })],
    });
    check(a);
  });

  it("allows less verbose access", () => {
    class SomeId extends Literal(Number) {
      someIdMethod() {
        return this.value;
      }
    }

    class B extends Shape({
      e: Enum(["a", "b"]),
      f: SomeId,
      g: Optional(String),
      h: Optional(Number),
    }) {}

    class A extends Shape({
      a: Number,
      b: String,
      c: Boolean,
      d: B,
    }) {}

    const a = new A({
      a: 1,
      b: "",
      c: false,
      d: new B({
        e: "a",
        f: new SomeId(123),
        g: undefined,
        h: undefined,
      }),
    });

    a.d.e;
    expect(a.d.f.someIdMethod()).toEqual(123);
    check(a);
  });
});