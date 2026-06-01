import { type ReactNode, Suspense, useMemo } from "react";

import type { RenderContext, Scope } from "@/render/context";
import { ErrorBoundary } from "@/render/error-boundary";
import { resolveProps } from "@/render/resolve-props";
import type { RaftersNode as RaftersNodeType } from "@/types";

export type RaftersNodeProps = {
  readonly node: RaftersNodeType;
  readonly scope: Scope;
  readonly ctx: RenderContext;
};

function RaftersNodeInner({ node, scope, ctx }: RaftersNodeProps): ReactNode {
  const entry = ctx.registry[node.type];
  if (!entry)
    throw new Error(`Rafters: component "${node.type}" not found in registry`);

  const resolved = useMemo(
    () => resolveProps(node.props ?? {}, scope, ctx),
    [node, scope, ctx]
  );

  const Component = entry.component;
  return <Component {...resolved} />;
}

export function RaftersNode(props: RaftersNodeProps): ReactNode {
  return (
    <ErrorBoundary fallback={props.ctx.fallback}>
      <Suspense fallback={props.ctx.loadingFallback({ type: props.node.type })}>
        <RaftersNodeInner {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
