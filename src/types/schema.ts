import {
  type CustomComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from "react";
import type { Simplify } from "type-fest";

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
