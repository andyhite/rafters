import type { DataContext, DataDef } from "@/data/types";
import type { JsonValue } from "@/types";

type Entry =
  | { status: "pending"; promise: Promise<void> }
  | { status: "success"; value: unknown }
  | { status: "error"; error: unknown };

export type DataCache = Map<string, Entry>;

export function createDataCache(): DataCache {
  return new Map();
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    "then" in value &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

/**
 * Suspense-style reader. Returns the loaded value, or throws a pending promise
 * (suspend) / a settled error (error boundary). Caches by `name` + `args`.
 */
export function readData(
  cache: DataCache,
  def: DataDef,
  args: JsonValue | undefined,
  context: DataContext
): unknown {
  const key = `${def.name}:${stableStringify(args)}`;
  const existing = cache.get(key);
  if (existing) {
    // Throwing a promise is the React Suspense contract, not an error throw.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (existing.status === "pending") throw existing.promise;
    if (existing.status === "error") throw existing.error;
    return existing.value;
  }

  let result: Promise<unknown> | unknown;
  try {
    result = def.load(context, args);
  } catch (error) {
    cache.set(key, { status: "error", error });
    throw error;
  }

  if (isThenable(result)) {
    const promise = Promise.resolve(result).then(
      (value) => {
        cache.set(key, { status: "success", value });
      },
      (error: unknown) => {
        cache.set(key, { status: "error", error });
      }
    );
    cache.set(key, { status: "pending", promise });
    // Suspend: throwing the pending promise is the React Suspense contract.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw promise;
  }

  cache.set(key, { status: "success", value: result });
  return result;
}
