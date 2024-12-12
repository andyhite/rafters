import { useMemo } from "react";

import { type Builder, type BuilderFn } from "@/core/create-builder";
import { createPropsProxy } from "@/core/create-props-proxy";
import { type Registry } from "@/types/registry";
import { type ComponentSchema } from "@/types/schema";

export type RendererProps<TRegistry extends Registry = Registry> = {
  readonly builder: Builder<TRegistry>;
  readonly registry: TRegistry;
  readonly schema:
    | BuilderFn<string, TRegistry>
    | ComponentSchema<string, TRegistry>;
  readonly scope?: Record<string, any>;
};

export function Renderer<TRegistry extends Registry = Registry>({
  builder,
  schema,
  scope = {},
  registry,
}: RendererProps<TRegistry>): React.ReactNode {
  if (typeof schema === "function") {
    schema = schema(builder);
  }

  const { key, props } = schema;

  const propsProxy = useMemo(
    () => createPropsProxy(Renderer, props, scope, registry),
    [props, registry, scope]
  );

  const Component = registry[schema.type];

  if (!Component) {
    throw new Error(`Component "${schema.type}" not found in registry`);
  }

  return <Component key={key} {...propsProxy} />;
}
