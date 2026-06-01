import { describe, expect, it } from "vitest";
import { z } from "zod";

import { inlineDataSource, resolveData } from "@/data/resolve";
import { inlineSource, resolveHandlers } from "@/handlers/resolve";
import { normalizeRegistry } from "@/registry/normalize";
import { validateDocument } from "@/validate/validate";

function Heading() {
  return null;
}

function Box() {
  return null;
}

const registry = normalizeRegistry({
  Heading: { component: Heading, props: z.object({ text: z.string() }) },
  Box, // accepts anything, no schema
});
const handlers = resolveHandlers([inlineSource({ save: () => undefined })]);
const data = resolveData([inlineDataSource({ listOrders: () => [] })]);
const context = { registry, handlers, data, version: 1 };

describe("validateDocument", () => {
  it("accepts a valid document", () => {
    const document = {
      version: 1,
      root: { type: "Heading", props: { text: "Hi" } },
    };
    expect(validateDocument(document, context)).toEqual({
      ok: true,
      value: document,
    });
  });

  it("rejects a bad version", () => {
    const r = validateDocument({ version: 2, root: { type: "Box" } }, context);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues[0].code).toBe("unsupported_version");
  });

  it("flags an unknown component with a suggestion", () => {
    const r = validateDocument(
      { version: 1, root: { type: "Headng", props: {} } },
      context
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0].code).toBe("unknown_component");
      expect(r.issues[0].suggestion).toBe("Heading");
      expect(r.issues[0].path).toEqual(["root"]);
    }
  });

  it("surfaces prop-schema failures with a nested path", () => {
    const r = validateDocument(
      { version: 1, root: { type: "Heading", props: { text: 5 } } },
      context
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0].code).toBe("invalid_prop");
      expect(r.issues[0].path).toEqual(["root", "props", "text"]);
    }
  });

  it("flags an unknown handler ref", () => {
    const document = {
      version: 1,
      root: { type: "Box", props: { onClick: { $handler: "saev" } } },
    };
    const r = validateDocument(document, context);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0].code).toBe("unknown_handler");
      expect(r.issues[0].suggestion).toBe("save");
      expect(r.issues[0].path).toEqual(["root", "props", "onClick"]);
    }
  });

  it("flags a reserved expression shape as unsupported", () => {
    const document = {
      version: 1,
      root: { type: "Heading", props: { text: { $expr: "a" } } },
    };
    const r = validateDocument(document, context);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues[0].code).toBe("unsupported_feature");
  });

  it("recurses into nested nodes and arrays", () => {
    const document = {
      version: 1,
      root: {
        type: "Box",
        props: { children: [{ type: "Heading", props: { text: 1 } }] },
      },
    };
    const r = validateDocument(document, context);
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(r.issues[0].path).toEqual([
        "root",
        "props",
        "children",
        0,
        "props",
        "text",
      ]);
  });

  it("flags an unknown data source with a suggestion", () => {
    const document = {
      version: 1,
      root: { type: "Box", props: { rows: { $data: "listOrdres" } } },
    };
    const r = validateDocument(document, context);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0].code).toBe("unknown_data_source");
      expect(r.issues[0].suggestion).toBe("listOrders");
      expect(r.issues[0].path).toEqual(["root", "props", "rows"]);
    }
  });

  it("accepts a known data ref and skips the component prop-schema for that key", () => {
    // Heading.text is a required string; here text is a $data ref, which must be
    // treated as a data ref (not validated against the string schema).
    const document = {
      version: 1,
      root: { type: "Heading", props: { text: { $data: "listOrders" } } },
    };
    expect(validateDocument(document, context).ok).toBe(true);
  });

  it("validates data-ref args against the def's schema", () => {
    const withArgs = resolveData([
      inlineDataSource({}),
      {
        id: "x",
        list: () => [
          {
            name: "search",
            args: z.object({ q: z.string() }),
            load: () => [],
          },
        ],
      },
    ]);
    const document = {
      version: 1,
      root: {
        type: "Box",
        props: { rows: { $data: "search", args: { q: 5 } } },
      },
    };
    const r = validateDocument(document, {
      registry,
      handlers,
      data: withArgs,
      version: 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0].code).toBe("invalid_data_args");
      expect(r.issues[0].path).toEqual(["root", "props", "rows", "args", "q"]);
    }
  });
});
