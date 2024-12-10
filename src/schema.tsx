import { type CustomComponentPropsWithRef, type ReactNode } from "react";
import type { Simplify } from "type-fest";
import { isObject, isString } from "lodash-es";
import Sandbox from "@nyariv/sandboxjs";
import type { Registry } from "./registry";
import type {
  ReplaceCallbackProps,
  ReplaceReactElementProps,
  ReplaceReactNodeProps,
} from "./utilities/props";

export type Callback = {
  type: "Callback";
  code: string;
  isPromise?: boolean;
};

export function isCallback(value: any): value is Callback {
  return isObject(value) && "type" in value && value.type === "Callback";
}

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
> & { key?: string };

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
    !isString(value) &&
    isObject(value) &&
    "type" in value &&
    isString(value.type) &&
    Object.hasOwn(registry, value.type)
  );
}

export function isSchemaArray<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
>(
  registry: TRegistry,
  value: unknown
): value is Array<Schema<TComponentType, TRegistry>> {
  return Array.isArray(value) && value.some((item) => isSchema(registry, item));
}

export type SchemaRendererProps<TRegistry extends Registry = Registry> = {
  readonly schema: Schema<string, TRegistry>;
  readonly registry: TRegistry;
  readonly scope?: Record<string, any>;
};

export function SchemaRenderer<TRegistry extends Registry = Registry>({
  schema,
  scope = {},
  registry,
}: SchemaRendererProps<TRegistry>): React.ReactNode {
  const Component = registry[schema.type];

  if (!Component) {
    throw new Error(`Component "${schema.type}" not found in registry`);
  }

  const { key, props = {} } = schema;

  return <Component key={key} {...createPropsProxy(props, registry, scope)} />;
}

export function renderSchema<TRegistry extends Registry>(
  schema: Schema<string, TRegistry> | Array<Schema<string, TRegistry>>,
  registry: TRegistry,
  scope?: Record<string, any>
): ReactNode {
  if (Array.isArray(schema)) {
    return schema.map((schema) => (
      <SchemaRenderer
        key={schema.key}
        schema={schema}
        registry={registry}
        scope={scope}
      />
    ));
  }

  return (
    <SchemaRenderer
      key={schema.key}
      schema={schema}
      registry={registry}
      scope={scope}
    />
  );
}

export function createPropsProxy<
  TProps extends Record<string, any>,
  TRegistry extends Registry,
>(props: TProps, registry: TRegistry, scope: Record<string, any> = {}) {
  const sandbox = new Sandbox();

  return new Proxy(props, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver) as
        | Callback
        | Schema
        | unknown;

      if (isCallback(value)) {
        return sandbox.compile(`return (${value.code});`)(scope).run();
      }

      if (isSchema(registry, value)) {
        return renderSchema(value, registry, scope);
      }

      if (isSchemaArray(registry, value)) {
        return value.map((item) =>
          isSchema(registry, item) ? renderSchema(item, registry, scope) : item
        );
      }

      return value;
    },
  });
}
