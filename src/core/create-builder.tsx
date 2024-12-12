import { type Registry } from "@/types/registry";
import {
  type CallbackSchema,
  type ComponentSchema,
  type ComponentSchemaProps,
} from "@/types/schema";

export type BuilderFn<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
> = (builder: Builder<TRegistry>) => ComponentSchema<TComponentType, TRegistry>;

export type Builder<TRegistry extends Registry = Registry> = {
  Callback: <TCallback extends (...args: any[]) => any>(
    callback: TCallback
  ) => CallbackSchema<TCallback>;
} & {
  [TComponentType in keyof TRegistry]: TComponentType extends string
    ? (
        props?: ComponentSchemaProps<TComponentType, TRegistry>
      ) => ComponentSchema<TComponentType, TRegistry>
    : never;
};

export function createBuilder<TRegistry extends Registry>(
  registry: TRegistry
): Builder<TRegistry> {
  return new Proxy(
    {
      Callback(code: (...args: any[]) => any) {
        return {
          type: "Callback",
          code: code.toString(),
          function: code,
        };
      },
    } as Builder<TRegistry>,
    {
      get(target, property: string) {
        if (!registry) return null;

        if (property in registry) {
          return ({ key, ...props }: ComponentSchemaProps) => {
            return {
              type: property,
              key,
              props,
            };
          };
        }

        if (property in target) {
          return target[property];
        }

        throw new Error(`Unknown Builder property: ${property}`);
      },
    }
  );
}
