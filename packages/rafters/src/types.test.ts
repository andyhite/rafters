import { describe, expect, it } from "vitest";

import type { HandlerRef, RaftersDocument, RaftersNode } from "@/types";

describe("core types", () => {
  it("documents are JSON-serializable shapes", () => {
    const handler: HandlerRef = { $handler: "save", args: [1, "x"] };
    const node: RaftersNode = {
      type: "Heading",
      key: "h1",
      props: { onClick: handler },
    };
    const document: RaftersDocument = { version: 1, root: node };
    expect(JSON.parse(JSON.stringify(document))).toEqual(document);
  });
});
