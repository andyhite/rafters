import * as z from "zod";

import type { JsonSchema, JsonSchemaAdapter } from "@/schema/json-schema";

/** A JSON-Schema adapter for Zod 4 schemas. Import from "@andyhite/rafters/zod-adapter". */
export const zodJsonSchemaAdapter: JsonSchemaAdapter = (
  schema
): JsonSchema | undefined => {
  if (schema["~standard"].vendor !== "zod") return undefined;
  return z.toJSONSchema(schema as unknown as z.ZodType) as JsonSchema;
};
