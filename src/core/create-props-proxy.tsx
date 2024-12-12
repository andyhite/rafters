import Sandbox from "@nyariv/sandboxjs";
import { isObject, isString } from "lodash-es";
import { type ComponentType } from "react";

import {
  type CallbackSchema,
  type ComponentSchema,
} from "@/components/renderer";
import { type Registry } from "@/types/registry";

export function isCallbackSchema(value: any): value is CallbackSchema<any> {
  return isObject(value) && "type" in value && value.type === "Callback";
}

export function isComponentSchema<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
>(
  registry: TRegistry,
  value: { [key: string]: any; type: TComponentType } | unknown
): value is ComponentSchema<TComponentType, TRegistry> {
  return (
    !isString(value) &&
    isObject(value) &&
    "type" in value &&
    isString(value.type) &&
    Object.hasOwn(registry, value.type)
  );
}

export function isComponentSchemaArray<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
>(
  registry: TRegistry,
  value: unknown
): value is Array<ComponentSchema<TComponentType, TRegistry>> {
  return (
    Array.isArray(value) &&
    value.some((item) => isComponentSchema(registry, item))
  );
}

export function createPropsProxy<TRegistry extends Registry>(
  Renderer: ComponentType<any>,
  props: Record<string, any>,
  scope: Record<string, any>,
  registry: TRegistry
) {
  const sandbox = new Sandbox();

  return new Proxy(props, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver) as
        | CallbackSchema<any>
        | ComponentSchema
        | unknown;

      if (isCallbackSchema(value)) {
        return sandbox.compile(`return (${value.code});`)(scope).run();
      }

      if (isComponentSchema(registry, value)) {
        return <Renderer schema={value} registry={registry} scope={scope} />;
      }

      if (isComponentSchemaArray(registry, value)) {
        return value.map((item) =>
          isComponentSchema(registry, item) ? (
            <Renderer
              key={item.key}
              schema={item}
              registry={registry}
              scope={scope}
            />
          ) : (
            item
          )
        );
      }

      return value;
    },
  });
}
