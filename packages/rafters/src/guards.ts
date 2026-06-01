import type { DataRef, HandlerRef } from "@/types";

/** Expression/function shapes reserved for phases 2-4 (rejected by the v1 validator). */
export const RESERVED_KEYS = ["$expr", "$bind", "$if", "$each", "$fn"] as const;
export type ReservedKey = (typeof RESERVED_KEYS)[number];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHandlerRef(value: unknown): value is HandlerRef {
  return isPlainObject(value) && typeof value.$handler === "string";
}

export function isDataRef(value: unknown): value is DataRef {
  return isPlainObject(value) && typeof value.$data === "string";
}

/** Structural check only — does the value look like a node? (type is a string) */
export function isNodeLike(value: unknown): value is { type: string } {
  return isPlainObject(value) && typeof value.type === "string";
}

/** Returns the first reserved key present on the value, or undefined. */
export function reservedKey(value: unknown): ReservedKey | undefined {
  if (!isPlainObject(value)) return undefined;
  return RESERVED_KEYS.find((key) => key in value);
}
