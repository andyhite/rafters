import React, {
  type CustomComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  useMemo,
} from "react";
import type { Simplify } from "type-fest";

import { type Builder, type BuilderFn } from "@/core/create-builder";
import { createPropsProxy } from "@/core/create-props-proxy";
import { type Registry } from "@/types/registry";
import { type IsExactUnion, type ReplaceUnionMember } from "@/types/utility";

export type ReplaceReactNodeProps<TProps, TRegistry extends Registry> = {
  [TKey in keyof TProps]: IsExactUnion<TProps[TKey], ReactNode> extends true
    ?
        | string
        | number
        | boolean
        | ComponentSchema<string, TRegistry>
        | Array<ComponentSchema<string, TRegistry>>
        | undefined
    : TProps[TKey];
};

export type ReplaceReactElementProps<TProps, TRegistry extends Registry> = {
  [TKey in keyof TProps]: ReplaceUnionMember<
    TProps[TKey],
    ReactElement,
    ComponentSchema<string, TRegistry>
  >;
};

export type ReplaceCallbackProps<TProps> = {
  [TKey in keyof TProps]: Extract<
    TProps[TKey],
    (...args: any[]) => any
  > extends (...args: any[]) => any
    ?
        | CallbackSchema<Extract<TProps[TKey], (...args: any[]) => any>>
        | Exclude<TProps[TKey], (...args: any[]) => any>
    : TProps[TKey];
};

export type ExtractProps<
  TComponentType extends string,
  TRegistry extends Registry,
> = CustomComponentPropsWithRef<TRegistry[TComponentType]>;

export type ReplaceProps<
  TComponentType extends string,
  TRegistry extends Registry = Registry,
> = Simplify<
  ReplaceCallbackProps<
    ReplaceReactElementProps<
      ReplaceReactNodeProps<ExtractProps<TComponentType, TRegistry>, TRegistry>,
      TRegistry
    >
  >
>;

export type CallbackSchema<TFunction extends (...args: any[]) => any> = {
  code: string;
  function: TFunction;
  type: "Callback";
};

export type ComponentSchemaProps<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
> = ReplaceProps<TComponentType, TRegistry> & {
  key?: string;
};

export type ComponentSchema<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
> = {
  key?: string;
  props: ExtractProps<TComponentType, TRegistry>;
  type: TComponentType;
};

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
