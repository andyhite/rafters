import type { DataDef } from "@/data/types";
import type { HandlerDef } from "@/handlers/types";
import type { NormalizedRegistry } from "@/registry/types";
import type { JsonSchema, JsonSchemaAdapter } from "@/schema/json-schema";

export type ComponentManifest = {
  type: string;
  describe?: string;
  props?: JsonSchema;
  childProps?: string[];
};

export type HandlerManifest = {
  name: string;
  describe?: string;
  args?: JsonSchema;
};

export type DataManifest = {
  name: string;
  describe?: string;
  args?: JsonSchema;
};

export type Manifest = {
  version: number;
  components: ComponentManifest[];
  handlers: HandlerManifest[];
  data: DataManifest[];
};

export function buildManifest(options: {
  version: number;
  registry: NormalizedRegistry;
  handlers: Map<string, HandlerDef>;
  data: Map<string, DataDef>;
  adapter: JsonSchemaAdapter;
}): Manifest {
  const components: ComponentManifest[] = Object.entries(options.registry).map(
    ([type, entry]) => {
      const component: ComponentManifest = { type };
      if (entry.describe !== undefined) component.describe = entry.describe;
      if (entry.childProps !== undefined)
        component.childProps = entry.childProps;
      if (entry.props) {
        const json = options.adapter(entry.props);
        if (json !== undefined) component.props = json;
      }

      return component;
    }
  );

  const handlers: HandlerManifest[] = [...options.handlers.values()].map(
    (def) => {
      const handler: HandlerManifest = { name: def.name };
      if (def.describe !== undefined) handler.describe = def.describe;
      if (def.args) {
        const json = options.adapter(def.args);
        if (json !== undefined) handler.args = json;
      }

      return handler;
    }
  );

  const data: DataManifest[] = [...options.data.values()].map((def) => {
    const entry: DataManifest = { name: def.name };
    if (def.describe !== undefined) entry.describe = def.describe;
    if (def.args) {
      const json = options.adapter(def.args);
      if (json !== undefined) entry.args = json;
    }

    return entry;
  });

  return { version: options.version, components, handlers, data };
}
