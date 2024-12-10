import type { Registry } from "./registry";
import type { Callback, Schema, SchemaProps } from "./schema";

export type BuilderFn<
  TComponentType extends string = string,
  TRegistry extends Registry = Registry,
> = (
  builder: Builder<TRegistry>
) =>
  | Schema<TComponentType, TRegistry>
  | Array<Schema<TComponentType, TRegistry>>;

export type Builder<TRegistry extends Registry = Registry> = {
  [TComponentType in keyof TRegistry]: TComponentType extends string
    ? (
        props?: SchemaProps<TComponentType, TRegistry>
      ) => Schema<TComponentType, TRegistry>
    : never;
} & {
  Callback: <TCallback extends (...args: any[]) => any>(
    callback: TCallback
  ) => Callback;
};

export function createBuilder<
  TRegistry extends Registry,
>(): Builder<TRegistry> {
  return new Proxy(
    {},
    {
      get(_, componentType: "Callback" & string) {
        if (componentType === "Callback") {
          return (code: (...args: any[]) => any) => {
            return {
              type: "Callback",
              code: code.toString(),
              isPromise: code instanceof Promise,
            };
          };
        }

        return ({ key, ...props }: SchemaProps) => {
          return {
            type: componentType,
            key,
            props,
          };
        };
      },
    }
  ) as Builder<TRegistry>;
}
