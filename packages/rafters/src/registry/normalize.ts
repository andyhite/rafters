import type {
  ComponentEntry,
  ComponentRegistryInput,
  NormalizedRegistry,
} from "@/registry/types";

function isEntry(value: unknown): value is ComponentEntry {
  return typeof value === "object" && value !== null && "component" in value;
}

export function normalizeRegistry(
  input: ComponentRegistryInput
): NormalizedRegistry {
  const out: NormalizedRegistry = {};
  for (const [name, value] of Object.entries(input)) {
    out[name] = isEntry(value) ? value : { component: value };
  }

  return out;
}
