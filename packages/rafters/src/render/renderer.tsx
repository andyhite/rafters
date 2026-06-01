import { type ReactNode } from "react";

import type { RenderContext, Scope } from "@/render/context";
import { RaftersNode } from "@/render/node";
import type { RaftersDocument, RaftersNode as RaftersNodeType } from "@/types";

export type RendererProps = {
  readonly document: RaftersDocument | RaftersNodeType;
  readonly scope?: Scope;
  readonly ctx: RenderContext;
};

function rootOf(document: RaftersDocument | RaftersNodeType): RaftersNodeType {
  return "root" in document ? document.root : document;
}

export function Renderer({
  document,
  scope = {},
  ctx,
}: RendererProps): ReactNode {
  return <RaftersNode node={rootOf(document)} scope={scope} ctx={ctx} />;
}
