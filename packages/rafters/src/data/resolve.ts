import type { DataDef, DataInput, DataSource } from "@/data/types";

export function inlineDataSource(data: DataInput): DataSource {
  return {
    id: "inline-data",
    list: () => Object.entries(data).map(([name, load]) => ({ name, load })),
  };
}

export function resolveData(sources: DataSource[]): Map<string, DataDef> {
  const map = new Map<string, DataDef>();
  for (const source of sources) {
    for (const def of source.list()) {
      if (map.has(def.name)) {
        throw new Error(
          `Rafters: data source name collision "${def.name}" (source "${source.id}")`
        );
      }

      map.set(def.name, def);
    }
  }

  return map;
}
