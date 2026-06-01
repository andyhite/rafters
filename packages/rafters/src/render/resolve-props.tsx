import { type ReactNode } from "react";

import { readData } from "@/data/cache";
import { isDataRef, isHandlerRef, isNodeLike } from "@/guards";
import type { RenderContext, Scope } from "@/render/context";
import { RaftersNode } from "@/render/node";
import type { HandlerRef, RaftersNode as RaftersNodeType } from "@/types";

function makeCallback(
  reference: HandlerRef,
  scope: Scope,
  context: RenderContext
): (...args: unknown[]) => unknown {
  return (...callArgs: unknown[]) => {
    const def = context.handlers.get(reference.$handler);
    if (!def)
      throw new Error(`Rafters: unknown handler "${reference.$handler}"`);
    return def.handler({ scope }, ...(reference.args ?? []), ...callArgs);
  };
}

export function resolveValue(
  value: unknown,
  scope: Scope,
  context: RenderContext
): unknown {
  if (isDataRef(value)) {
    const def = context.data.get(value.$data);
    if (!def) throw new Error(`Rafters: unknown data source "${value.$data}"`);
    return readData(context.cache, def, value.args, { scope });
  }

  if (isHandlerRef(value)) return makeCallback(value, scope, context);
  if (isNodeLike(value) && context.registry[value.type]) {
    return (
      <RaftersNode
        node={value as RaftersNodeType}
        scope={scope}
        ctx={context}
      />
    );
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      isNodeLike(item) && context.registry[item.type] ? (
        <RaftersNode
          key={(item as RaftersNodeType).key ?? index}
          node={item as RaftersNodeType}
          scope={scope}
          ctx={context}
        />
      ) : (
        (resolveValue(item, scope, context) as ReactNode)
      )
    );
  }

  return value;
}

export function resolveProps(
  props: Record<string, unknown>,
  scope: Scope,
  context: RenderContext
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    out[key] = resolveValue(value, scope, context);
  }

  return out;
}
