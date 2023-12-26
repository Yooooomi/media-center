import { Shape } from "../shape";
import { check } from "../testUtils";
import { Child } from "./child";

describe("Definition: Child", () => {
  it("uses keyword notation", () => {
    class Other extends Shape({
      value: String,
    }) { }

    class Test extends Shape({
      value: Child(Other),
    }) { }

    const a = new Test({ value: new Other({ value: "ya" }) });
    expect(a.value.value).toEqual("ya");
    check(Test, a);
  });

  it("uses keyword-less notation", () => {
    class Other extends Shape({
      value: String,
    }) { }

    class Test extends Shape({
      value: Other,
    }) { }

    const a = new Test({ value: new Other({ value: "ya" }) });
    expect(a.value.value).toEqual("ya");
    check(Test, a);
  });
});
