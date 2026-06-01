import { describe, expect, it } from "vitest";

import { inlineDataSource, resolveData } from "@/data/resolve";

describe("resolveData", () => {
  it("flattens inline loaders into a name->def map", () => {
    const listOrders = () => [{ id: 1 }];
    const map = resolveData([inlineDataSource({ listOrders })]);
    expect(map.get("listOrders")?.load).toBe(listOrders);
    expect(map.get("listOrders")?.name).toBe("listOrders");
  });

  it("gives the inline source a stable id", () => {
    expect(inlineDataSource({}).id).toBe("inline-data");
  });

  it("throws on a name collision across sources", () => {
    const a = inlineDataSource({ dup: () => 1 });
    const b = { id: "mcp", list: () => [{ name: "dup", load: () => 2 }] };
    expect(() => resolveData([a, b])).toThrow(/collision.*dup/i);
  });
});
