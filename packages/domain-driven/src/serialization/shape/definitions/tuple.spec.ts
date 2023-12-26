import { Shape } from "../shape";
import { check } from "../testUtils";
import { Tuple } from "./tuple";

describe("Definition: Tuple", () => {
  it("keyword notation", () => {
    class Test extends Shape({
      tuple: Tuple(Number, String),
    }) { }

    const a = new Test({
      tuple: [1, "a"],
    });

    check(Test, a);
  });
});
