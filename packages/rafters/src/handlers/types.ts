import type { StandardSchemaV1 } from "@standard-schema/spec";

export type HandlerContext = {
  scope: Record<string, unknown>;
};

export type Handler = (context: HandlerContext, ...args: any[]) => unknown;

export type HandlerDef = {
  name: string;
  describe?: string;
  args?: StandardSchemaV1;
  handler: Handler;
};

/** A pluggable provider of handlers (the seam a future MCP integration plugs into). */
export type HandlerSource = {
  id: string;
  list: () => HandlerDef[];
};

export type HandlersInput = Record<string, Handler>;
