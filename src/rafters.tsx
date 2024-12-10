import { type ComponentType } from "react";
import { createBuilder, type BuilderFn } from "./builder";
import { type Registry } from "./registry";
import { renderSchema, SchemaRenderer, type Schema } from "./schema";

export type RendererProps<TRegistry extends Registry> = {
  readonly schema:
    | BuilderFn<string, TRegistry>
    | Schema<string, TRegistry>
    | Array<Schema<string, TRegistry>>;
  readonly scope?: Record<string, any>;
};

export type Rafters<TRegistry extends Registry = Registry> = {
  Renderer: ComponentType<RendererProps<TRegistry>>;
  Builder: (
    builderFn: BuilderFn<string, TRegistry>
  ) => Schema<string, TRegistry> | Array<Schema<string, TRegistry>>;
};

export const createRafters = <TRegistry extends Registry = Registry>(
  components: TRegistry
): Rafters<TRegistry> => {
  const builder = createBuilder<TRegistry>();

  function Renderer({ schema, scope }: RendererProps<TRegistry>) {
    if (typeof schema === "function") {
      schema = schema(builder);
    }

    return renderSchema(schema, components, scope);
  }

  function Builder(callbackFn: BuilderFn<string, TRegistry>) {
    return callbackFn(builder);
  }

  return { Renderer, Builder };
};
