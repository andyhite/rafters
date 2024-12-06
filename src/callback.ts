import Sandbox from "@nyariv/sandboxjs";
import { isObject } from "lodash-es";
import { replaceValues } from "./utilities";

const sandbox = new Sandbox();

export type Callback = {
  type: "Callback";
  code: string;
};

export function isCallback(value: unknown): value is Callback {
  return isObject(value) && "type" in value && value.type === "Callback";
}

export function renderCallback(
  callback: Callback,
  scope: Record<string, any> = {}
) {
  return sandbox.compile(`return ${callback.code}`)(scope).run() as (
    ...args: any[]
  ) => any;
}

export function renderCallbackProps<TProps extends Record<string, any>>(
  props: TProps,
  scope?: Record<string, any>
) {
  return replaceValues<TProps, Callback, (...args: any[]) => any>(
    props,
    (value) => isCallback(value),
    (callback) => renderCallback(callback, scope)
  );
}
