import { describe, expect, it } from "vitest";
import { z } from "zod";

import { validateWithSchema } from "@/schema/standard";

describe("validateWithSchema", () => {
  it("returns ok with the parsed value", () => {
    const result = validateWithSchema(z.object({ n: z.number() }), { n: 1 });
    expect(result).toEqual({ ok: true, value: { n: 1 } });
  });

  it("maps issues with normalized paths", () => {
    const result = validateWithSchema(z.object({ n: z.number() }), { n: "x" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].path).toEqual(["n"]);
      expect(typeof result.issues[0].message).toBe("string");
    }
  });

  it("throws on async validation", () => {
    const asyncSchema = {
      "~standard": {
        version: 1,
        vendor: "x",
        validate: async (v: unknown) => ({ value: v }),
      },
    } as any;
    expect(() => validateWithSchema(asyncSchema, 1)).toThrow(/asynchronous/i);
  });
});
