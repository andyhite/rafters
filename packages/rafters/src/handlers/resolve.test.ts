import { describe, expect, it } from "vitest";

import { inlineSource, resolveHandlers } from "@/handlers/resolve";

describe("resolveHandlers", () => {
  it("flattens inline handlers into a name->def map", () => {
    const save = () => "saved";
    const map = resolveHandlers([inlineSource({ save })]);
    expect(map.get("save")?.handler).toBe(save);
    expect(map.get("save")?.name).toBe("save");
  });

  it("throws on a name collision across sources", () => {
    const a = inlineSource({ dup: () => 1 });
    const b = { id: "other", list: () => [{ name: "dup", handler: () => 2 }] };
    expect(() => resolveHandlers([a, b])).toThrow(/collision.*dup/i);
  });
});
