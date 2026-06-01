import { describe, expect, it } from "vitest";

import { createBuilder } from "@/builder";
import { normalizeRegistry } from "@/registry/normalize";

function Heading() {
  return null;
}

function Box() {
  return null;
}

const builder = createBuilder(normalizeRegistry({ Heading, Box }));

describe("createBuilder", () => {
  it("builds a node from props, lifting key to the top level", () => {
    expect(builder.Heading({ key: "h", children: "Hi" })).toEqual({
      type: "Heading",
      key: "h",
      props: { children: "Hi" },
    });
  });

  it("builds handler refs", () => {
    expect(builder.handler("save", 1)).toEqual({ $handler: "save", args: [1] });
    expect(builder.handler("save")).toEqual({ $handler: "save" });
  });

  it("builds data refs", () => {
    expect(builder.data("listOrders")).toEqual({ $data: "listOrders" });
    expect(builder.data("search", { q: "x" })).toEqual({
      $data: "search",
      args: { q: "x" },
    });
  });

  it("throws for an unknown component", () => {
    expect(() => (builder as any).Nope()).toThrow(/unknown builder/i);
  });
});
