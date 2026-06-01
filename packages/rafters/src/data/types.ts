import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { JsonValue } from "@/types";

export type DataContext = { scope: Record<string, unknown> };

/** May be sync or async; the renderer awaits it either way. */
export type DataLoader = (
  context: DataContext,
  args?: JsonValue
) => Promise<unknown> | unknown;

export type DataDef = {
  name: string;
  describe?: string;
  args?: StandardSchemaV1;
  load: DataLoader;
};

/** The seam a private MCP-resource provider implements. */
export type DataSource = {
  id: string;
  list: () => DataDef[];
};

/** Inline sugar: a name -> loader map. */
export type DataInput = Record<string, DataLoader>;
