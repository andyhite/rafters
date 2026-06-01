import { describe, expect, it, vi } from "vitest";

import { createDataCache, readData, stableStringify } from "@/data/cache";
import type { DataDef } from "@/data/types";

const context = { scope: {} };

function def(name: string, load: DataDef["load"]): DataDef {
  return { name, load };
}

describe("stableStringify", () => {
  it("is key-order independent", () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(
      stableStringify({ b: 2, a: 1 })
    );
  });
});

describe("readData", () => {
  it("returns a synchronous loader's value immediately and caches it", () => {
    const load = vi.fn(() => ({ ok: true }));
    const cache = createDataCache();
    const d = def("now", load);
    expect(readData(cache, d, undefined, context)).toEqual({ ok: true });
    expect(readData(cache, d, undefined, context)).toEqual({ ok: true });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("throws a promise while async, then returns the value (loaded once)", async () => {
    const load = vi.fn(async () => "value");
    const cache = createDataCache();
    const d = def("later", load);

    let thrown: unknown;
    try {
      readData(cache, d, undefined, context);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Promise);
    await thrown;
    expect(readData(cache, d, undefined, context)).toBe("value");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("throws the error after a rejected load", async () => {
    const cache = createDataCache();
    const d = def("boom", async () => {
      throw new Error("nope");
    });

    try {
      readData(cache, d, undefined, context);
    } catch (error) {
      await error;
    }

    expect(() => readData(cache, d, undefined, context)).toThrow("nope");
  });

  it("keys by args (different args load separately)", () => {
    const load = vi.fn((_c: unknown, args: unknown) => args);
    const cache = createDataCache();
    const d = def("byArgs", load);
    readData(cache, d, { a: 1 } as never, context);
    readData(cache, d, { a: 2 } as never, context);
    readData(cache, d, { a: 1 } as never, context);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
