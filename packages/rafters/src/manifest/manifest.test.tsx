import { describe, expect, it } from "vitest";
import { z } from "zod";

import { inlineDataSource, resolveData } from "@/data/resolve";
import { inlineSource, resolveHandlers } from "@/handlers/resolve";
import { buildManifest } from "@/manifest/manifest";
import { normalizeRegistry } from "@/registry/normalize";
import { zodJsonSchemaAdapter } from "@/zod-adapter";

function Heading() {
  return null;
}

function Raw() {
  return null;
}

describe("buildManifest", () => {
  it("describes components (with JSON Schema) and handlers", () => {
    const registry = normalizeRegistry({
      Heading: {
        component: Heading,
        describe: "A heading",
        props: z.object({ children: z.string() }),
        childProps: ["children"],
      },
      Raw, // no schema
    });
    const handlers = resolveHandlers([inlineSource({ save: () => undefined })]);
    const manifest = buildManifest({
      version: 1,
      registry,
      handlers,
      data: resolveData([]),
      adapter: zodJsonSchemaAdapter,
    });

    expect(manifest.version).toBe(1);
    const heading = manifest.components.find((c) => c.type === "Heading")!;
    expect(heading.describe).toBe("A heading");
    expect((heading.props as any).type).toBe("object");
    expect(heading.childProps).toEqual(["children"]);

    const raw = manifest.components.find((c) => c.type === "Raw")!;
    expect(raw.props).toBeUndefined();

    expect(manifest.handlers).toEqual([{ name: "save" }]);
    expect(manifest.data).toEqual([]);
  });

  it("describes data sources with JSON Schema", () => {
    const registry = normalizeRegistry({ Raw });
    const handlers = resolveHandlers([]);
    const data = resolveData([
      {
        id: "x",
        list: () => [
          {
            name: "listOrders",
            describe: "Open orders",
            args: z.object({ status: z.string() }),
            load: () => [],
          },
        ],
      },
      inlineDataSource({ ping: () => "pong" }),
    ]);
    const manifest = buildManifest({
      version: 1,
      registry,
      handlers,
      data,
      adapter: zodJsonSchemaAdapter,
    });

    const listOrders = manifest.data.find((d) => d.name === "listOrders")!;
    expect(listOrders.describe).toBe("Open orders");
    expect((listOrders.args as any).type).toBe("object");

    const ping = manifest.data.find((d) => d.name === "ping")!;
    expect(ping.args).toBeUndefined();
  });
});
