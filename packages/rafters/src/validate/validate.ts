import type { DataDef } from "@/data/types";
import { isDataRef, isHandlerRef, isNodeLike, reservedKey } from "@/guards";
import type { HandlerDef } from "@/handlers/types";
import type { NormalizedRegistry } from "@/registry/types";
import { validateWithSchema } from "@/schema/standard";
import type { RaftersDocument } from "@/types";
import { closest } from "@/validate/distance";

export type Path = Array<string | number>;

export type Issue = {
  path: Path;
  code: string;
  message: string;
  suggestion?: string;
};

export type ValidationContext = {
  registry: NormalizedRegistry;
  handlers: Map<string, HandlerDef>;
  data: Map<string, DataDef>;
  version: number;
};

export type ValidationResult =
  | { ok: true; value: RaftersDocument }
  | { ok: false; issues: Issue[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateDocument(
  document: unknown,
  context: ValidationContext
): ValidationResult {
  const issues: Issue[] = [];

  if (!isObject(document)) {
    return {
      ok: false,
      issues: [
        {
          path: [],
          code: "invalid_document",
          message: "Document must be an object.",
        },
      ],
    };
  }

  if (document.version !== context.version) {
    issues.push({
      path: ["version"],
      code: "unsupported_version",
      message: `Unsupported document version ${String(document.version)}; expected ${context.version}.`,
    });
  }

  if (!isObject(document.root)) {
    issues.push({
      path: ["root"],
      code: "invalid_document",
      message: "Document.root must be a node object.",
    });
    return { ok: false, issues };
  }

  validateNode(document.root, ["root"], context, issues);

  return issues.length === 0
    ? { ok: true, value: document as unknown as RaftersDocument }
    : { ok: false, issues };
}

/**
 * A "special" prop value is one the component's plain prop-schema is not meant to
 * describe: a handler ref, a (registered) node, a reserved expression shape, or an array
 * containing any of those. Schema issues for keys holding special values are suppressed —
 * those keys are checked structurally instead.
 */
function isSpecialValue(value: unknown, context: ValidationContext): boolean {
  if (reservedKey(value)) return true;
  if (isHandlerRef(value)) return true;
  if (isDataRef(value)) return true;
  if (isNodeLike(value) && context.registry[value.type]) return true;
  if (Array.isArray(value))
    return value.some((item) => isSpecialValue(item, context));
  return false;
}

function validateNode(
  node: Record<string, unknown>,
  path: Path,
  context: ValidationContext,
  issues: Issue[]
): void {
  if (typeof node.type !== "string") {
    issues.push({
      path,
      code: "invalid_node",
      message: "Node.type must be a string.",
    });
    return;
  }

  const entry = context.registry[node.type];
  if (!entry) {
    issues.push({
      path,
      code: "unknown_component",
      message: `Unknown component "${node.type}".`,
      suggestion: closest(node.type, Object.keys(context.registry)),
    });
    return;
  }

  const props = isObject(node.props) ? node.props : {};
  const specialKeys = new Set(
    Object.keys(props).filter((key) => isSpecialValue(props[key], context))
  );

  if (entry.props) {
    const result = validateWithSchema(entry.props, props);
    if (!result.ok) {
      for (const issue of result.issues) {
        const topKey = issue.path[0];
        if (typeof topKey === "string" && specialKeys.has(topKey)) continue;
        issues.push({
          path: [...path, "props", ...issue.path],
          code: "invalid_prop",
          message: issue.message,
        });
      }
    }
  }

  for (const [key, value] of Object.entries(props)) {
    validatePropertyValue(value, [...path, "props", key], context, issues);
  }
}

function validatePropertyValue(
  value: unknown,
  path: Path,
  context: ValidationContext,
  issues: Issue[]
): void {
  const reserved = reservedKey(value);
  if (reserved) {
    issues.push({
      path,
      code: "unsupported_feature",
      message: `"${reserved}" is not supported in this version of Rafters.`,
    });
    return;
  }

  if (isHandlerRef(value)) {
    const def = context.handlers.get(value.$handler);
    if (!def) {
      issues.push({
        path,
        code: "unknown_handler",
        message: `Unknown handler "${value.$handler}".`,
        suggestion: closest(value.$handler, [...context.handlers.keys()]),
      });
      return;
    }

    if (def.args && Array.isArray(value.args)) {
      const result = validateWithSchema(def.args, value.args);
      if (!result.ok) {
        for (const issue of result.issues) {
          issues.push({
            path: [...path, "args", ...issue.path],
            code: "invalid_handler_args",
            message: issue.message,
          });
        }
      }
    }

    return;
  }

  if (isDataRef(value)) {
    const def = context.data.get(value.$data);
    if (!def) {
      issues.push({
        path,
        code: "unknown_data_source",
        message: `Unknown data source "${value.$data}".`,
        suggestion: closest(value.$data, [...context.data.keys()]),
      });
      return;
    }

    if (def.args && value.args !== undefined) {
      const result = validateWithSchema(def.args, value.args);
      if (!result.ok) {
        for (const issue of result.issues) {
          issues.push({
            path: [...path, "args", ...issue.path],
            code: "invalid_data_args",
            message: issue.message,
          });
        }
      }
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries())
      validatePropertyValue(item, [...path, index], context, issues);
    return;
  }

  // Treat as a node only when the type is registered (consistent with the renderer).
  // Unregistered `{ type: ... }` values are passed through as plain data in v1.
  if (isNodeLike(value) && context.registry[value.type]) {
    validateNode(value as Record<string, unknown>, path, context, issues);
  }
}
