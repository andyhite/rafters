import { describe, expect, it } from "vitest";

import {
  isDataRef,
  isHandlerRef,
  isNodeLike,
  RESERVED_KEYS,
  reservedKey,
} from "@/guards";

describe("guards", () => {
  it("detects handler refs", () => {
    expect(isHandlerRef({ $handler: "x" })).toBe(true);
    expect(isHandlerRef({ $handler: 1 })).toBe(false);
    expect(isHandlerRef({ type: "X" })).toBe(false);
    expect(isHandlerRef("nope")).toBe(false);
  });

  it("detects node-like objects (string type)", () => {
    expect(isNodeLike({ type: "Heading" })).toBe(true);
    expect(isNodeLike({ type: 1 })).toBe(false);
    expect(isNodeLike([])).toBe(false);
    expect(isNodeLike(null)).toBe(false);
  });

  it("flags reserved expression keys", () => {
    expect(RESERVED_KEYS).toContain("$expr");
    expect(reservedKey({ $expr: "a + b" })).toBe("$expr");
    expect(reservedKey({ $handler: "x" })).toBeUndefined();
    expect(reservedKey({ label: "x" })).toBeUndefined();
  });

  it("detects data refs", () => {
    expect(isDataRef({ $data: "listOrders" })).toBe(true);
    expect(isDataRef({ $data: "x", args: { n: 1 } })).toBe(true);
    expect(isDataRef({ $data: 1 })).toBe(false);
    expect(isDataRef({ $handler: "x" })).toBe(false);
    expect(isDataRef("nope")).toBe(false);
  });
});
