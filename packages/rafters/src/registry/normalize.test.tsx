import { describe, expect, it } from "vitest";

import { normalizeRegistry } from "@/registry/normalize";

function Bare() {
  return null;
}

function WithSchema() {
  return null;
}

describe("normalizeRegistry", () => {
  it("wraps a bare component into an entry", () => {
    const reg = normalizeRegistry({ Bare });
    expect(reg.Bare.component).toBe(Bare);
    expect(reg.Bare.props).toBeUndefined();
  });

  it("passes through an explicit entry", () => {
    const schema = {
      "~standard": {
        version: 1,
        vendor: "x",
        validate: (v: unknown) => ({ value: v }),
      },
    };
    const reg = normalizeRegistry({
      WithSchema: {
        component: WithSchema,
        describe: "d",
        props: schema as any,
        childProps: ["children"],
      },
    });
    expect(reg.WithSchema.component).toBe(WithSchema);
    expect(reg.WithSchema.describe).toBe("d");
    expect(reg.WithSchema.props).toBe(schema);
    expect(reg.WithSchema.childProps).toEqual(["children"]);
  });
});
