import type { ComponentType } from "react";

import { type BuilderFn, createBuilder } from "./create-builder";

import {
  type ComponentSchema,
  Renderer,
  type RendererProps,
} from "@/components/renderer";
import { type Registry } from "@/types/registry";

export type Rafters<TRegistry extends Registry = Registry> = {
  Renderer: ComponentType<
    Omit<RendererProps<TRegistry>, "registry" | "builder">
  >;
  Builder: <TComponentType extends string>(
    callbackFn: BuilderFn<TComponentType, TRegistry>
  ) => ComponentSchema;
};

export const createRafters = <TRegistry extends Registry = Registry>(
  registry: TRegistry
): Rafters<TRegistry> => {
  const builder = createBuilder<TRegistry>(registry);

  return {
    Renderer(props) {
      return <Renderer registry={registry} builder={builder} {...props} />;
    },
    Builder(callbackFn) {
      return callbackFn(builder);
    },
  };
};
