import type {
  HandlerDef,
  HandlersInput,
  HandlerSource,
} from "@/handlers/types";

export function inlineSource(handlers: HandlersInput): HandlerSource {
  return {
    id: "inline",
    list: () =>
      Object.entries(handlers).map(([name, handler]) => ({ name, handler })),
  };
}

export function resolveHandlers(
  sources: HandlerSource[]
): Map<string, HandlerDef> {
  const map = new Map<string, HandlerDef>();
  for (const source of sources) {
    for (const def of source.list()) {
      if (map.has(def.name)) {
        throw new Error(
          `Rafters: handler name collision "${def.name}" (source "${source.id}")`
        );
      }

      map.set(def.name, def);
    }
  }

  return map;
}
