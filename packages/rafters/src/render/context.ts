import type { ReactNode } from "react";

import type { DataCache } from "@/data/cache";
import type { DataDef } from "@/data/types";
import type { HandlerDef } from "@/handlers/types";
import type { NormalizedRegistry } from "@/registry/types";

export type Scope = Record<string, unknown>;

export type RenderContext = {
  registry: NormalizedRegistry;
  handlers: Map<string, HandlerDef>;
  data: Map<string, DataDef>;
  cache: DataCache;
  fallback: (error: Error) => ReactNode;
  loadingFallback: (info: { type: string }) => ReactNode;
};
