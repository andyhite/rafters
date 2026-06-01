import type { NormalizedRegistry } from "@/registry/types";
import type { DataRef, HandlerRef, JsonValue, RaftersNode } from "@/types";

type ComponentFactory = (
  props?: Record<string, unknown> & { key?: string }
) => RaftersNode;

export type Builder = {
  handler: (name: string, ...args: unknown[]) => HandlerRef;
  data: (name: string, args?: JsonValue) => DataRef;
} & Record<string, ComponentFactory>;

export function createBuilder(registry: NormalizedRegistry): Builder {
  const base = {
    handler(name: string, ...args: unknown[]): HandlerRef {
      return args.length > 0
        ? { $handler: name, args: args as HandlerRef["args"] }
        : { $handler: name };
    },
    data(name: string, args?: JsonValue): DataRef {
      return args === undefined ? { $data: name } : { $data: name, args };
    },
  };

  return new Proxy(base as Builder, {
    get(target, property: string) {
      if (property in target)
        return (target as Record<string, unknown>)[property];
      if (property in registry) {
        return ({ key, ...props }: { key?: string } = {}): RaftersNode => {
          const node: RaftersNode = {
            type: property,
            props: props as RaftersNode["props"],
          };
          if (key !== undefined) node.key = key;
          return node;
        };
      }

      throw new Error(`Unknown builder property: ${property}`);
    },
  });
}
