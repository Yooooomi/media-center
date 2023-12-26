import { Shape } from "../shape";
import { check } from "../testUtils";
import { Dict } from "./dict";

describe("Definition: Dict", () => {
  it("uses keyword notation", () => {
    class Test extends Shape(
      Dict({
        value: Number,
      })
    ) { }

    // @ts-expect-error - missing value
    expect(() => new Test()).toThrow();

    const a = new Test({ value: 1 });
    expect(a.value).toEqual(1);
    check(Test, a);
  });

  it("uses keyword-less notation", () => {
    class Test extends Shape({
      value: Number,
    }) { }

    // @ts-expect-error - missing value
    expect(() => new Test()).toThrow();

    const a = new Test({ value: 1 });
    expect(a.value).toEqual(1);
    check(Test, a);
  });
});
