/* eslint-disable @typescript-eslint/ban-types */
import type { ReactElement, ReactNode } from "react";
import type { IsExactUnion, ReplaceUnionMember } from "./type";

export type ReplaceReactNodeProps<TObject, TReplaceType> = {
  [TKey in keyof TObject]: IsExactUnion<TObject[TKey], ReactNode> extends true
    ?
        | string
        | number
        | boolean
        | TReplaceType
        | TReplaceType[]
        | null
        | undefined
    : TObject[TKey];
};

export type ReplaceReactElementProps<TObject, TReplaceType> = {
  [TKey in keyof TObject]: ReplaceUnionMember<
    TObject[TKey],
    ReactElement,
    TReplaceType
  >;
};

export type ReplaceCallbackProps<TObject, TReplaceType> = {
  [TKey in keyof TObject]: Extract<
    TObject[TKey],
    (...args: any[]) => any
  > extends (...args: any[]) => any
    ? TReplaceType | Exclude<TObject[TKey], (...args: any[]) => any>
    : TObject[TKey];
};
