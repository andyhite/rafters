import type {
  CustomComponentPropsWithRef,
  ReactElement,
  ReactNode,
} from "react";
import type { Simplify } from "type-fest";
import { isObject, isString } from "lodash-es";
import { replaceValues } from "./utilities";
import type { Registry } from "./registry";
import { renderCallbackProps, type Callback } from "./callback";
import type {
  ReplaceCallbackProps,
  ReplaceReactElementProps,
  ReplaceReactNodeProps,
} from "./utilities/props";

export type SchemaProps<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
> = Simplify<
  ReplaceCallbackProps<
    ReplaceReactElementProps<
      ReplaceReactNodeProps<
        CustomComponentPropsWithRef<TRegistry[TComponentType]>,
        Schema<string, TRegistry>
      >,
      Schema<string, TRegistry>
    >,
    Callback
  >
>;

export type Schema<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
> = {
  type: TComponentType;
  key?: string;
  props?: SchemaProps<TComponentType, TRegistry>;
};

export function isSchema<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
>(
  registry: TRegistry,
  value: { [key: string]: any; type: TComponentType } | unknown
): value is Schema<TComponentType, TRegistry> {
  return (
    isObject(value) &&
    "type" in value &&
    isString(value.type) &&
    Object.hasOwn(registry, value.type)
  );
}

export function renderSchema<TRegistry extends Registry = Registry>(
  schema: Schema<string, TRegistry> | Array<Schema<string, TRegistry>>,
  registry: TRegistry,
  scope: Record<string, any> = {}
): React.ReactNode {
  if (Array.isArray(schema)) {
    return schema.map((schema) => renderSchema(schema, registry, scope));
  }

  const Component = registry[schema.type];

  if (!Component) {
    throw new Error(`Component "${schema.type}" not found in registry`);
  }

  const { key, props = {} } = schema;

  return (
    <Component
      key={key}
      {...renderCallbackProps(renderSchemaProps(props, registry, scope), scope)}
    />
  );
}

export function renderSchemaProps<
  TProps extends Record<string, any>,
  TRegistry extends Registry = Registry,
>(props: TProps, registry: TRegistry, scope?: Record<string, any>) {
  return replaceValues<TProps, Schema<string, TRegistry>, ReactNode>(
    props,
    (value) => isSchema(registry, value),
    (schema) => renderSchema(schema, registry, scope)
  );
}
