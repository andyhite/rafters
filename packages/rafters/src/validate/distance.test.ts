import { describe, expect, it } from "vitest";

import { closest } from "@/validate/distance";

describe("closest", () => {
  it("finds the nearest candidate within threshold", () => {
    expect(closest("Headng", ["Heading", "Form", "Field"])).toBe("Heading");
  });
  it("returns undefined when nothing is close", () => {
    expect(closest("zzzzzz", ["Heading", "Form"])).toBeUndefined();
  });
  it("returns undefined for empty candidates", () => {
    expect(closest("x", [])).toBeUndefined();
  });
});
