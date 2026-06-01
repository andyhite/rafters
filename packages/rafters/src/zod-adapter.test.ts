import { describe, expect, it } from "vitest";
import { z } from "zod";

import { noopAdapter } from "@/schema/json-schema";
import { zodJsonSchemaAdapter } from "@/zod-adapter";

describe("zodJsonSchemaAdapter", () => {
  it("converts a zod schema to JSON Schema with descriptions", () => {
    const schema = z.object({ name: z.string().describe("Your name") });
    const json = zodJsonSchemaAdapter(schema) as any;
    expect(json.type).toBe("object");
    expect(json.properties.name.type).toBe("string");
    expect(json.properties.name.description).toBe("Your name");
  });

  it("returns undefined for non-zod schemas", () => {
    const fake = {
      "~standard": {
        version: 1,
        vendor: "valibot",
        validate: (v: unknown) => ({ value: v }),
      },
    } as any;
    expect(zodJsonSchemaAdapter(fake)).toBeUndefined();
  });

  it("noopAdapter always returns undefined", () => {
    expect(noopAdapter(z.string())).toBeUndefined();
  });
});
