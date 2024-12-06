import { type ComponentType } from "react";
import { createBuilder, type Builder, type BuilderFn } from "./builder";
import { type Registry } from "./registry";
import { renderSchema, type Schema } from "./schema";

export type RendererProps<TRegistry extends Registry> = {
  schema:
    | BuilderFn<string, TRegistry>
    | Schema<string, TRegistry>
    | Array<Schema<string, TRegistry>>;
  scope?: Record<string, any>;
};

export type CreateRaftersReturn<TRegistry extends Registry> = {
  Renderer: ComponentType<RendererProps<TRegistry>>;
  Builder: (
    builderFn: BuilderFn<string, TRegistry>
  ) => Schema<string, TRegistry> | Array<Schema<string, TRegistry>>;
};

export const createRafters = <TRegistry extends Registry = Registry>(
  components: TRegistry
): CreateRaftersReturn<TRegistry> => {
  const builder = createBuilder<TRegistry>();

  return {
    Renderer({ schema, scope }) {
      if (typeof schema === "function") {
        schema = schema(builder);
      }

      return renderSchema(schema, components, scope);
    },
    Builder(callbackFn) {
      return callbackFn(builder);
    },
  };
};
