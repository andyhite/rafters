import type { StandardSchemaV1 } from "@standard-schema/spec";

export type SchemaIssue = { message: string; path: Array<string | number> };

export type SchemaResult =
  | { ok: true; value: unknown }
  | { ok: false; issues: SchemaIssue[] };

function normalizePath(
  path: StandardSchemaV1.Issue["path"]
): Array<string | number> {
  if (!path) return [];
  return Array.from(path, (segment) => {
    const key = typeof segment === "object" ? segment.key : segment;
    return typeof key === "number" ? key : String(key);
  });
}

export function validateWithSchema(
  schema: StandardSchemaV1,
  value: unknown
): SchemaResult {
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise) {
    throw new TypeError(
      "Rafters: asynchronous schema validation is not supported"
    );
  }

  if (result.issues) {
    return {
      ok: false,
      issues: result.issues.map((issue) => ({
        message: issue.message,
        path: normalizePath(issue.path),
      })),
    };
  }

  return { ok: true, value: result.value };
}
