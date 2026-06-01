import type { StandardSchemaV1 } from "@standard-schema/spec";

export type JsonSchema = Record<string, unknown>;

/** Converts a Standard Schema to JSON Schema, or returns undefined if unsupported. */
export type JsonSchemaAdapter = (
  schema: StandardSchemaV1
) => JsonSchema | undefined;

export const noopAdapter: JsonSchemaAdapter = () => undefined;
