import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDataCache } from "@/data/cache";
import { resolveData } from "@/data/resolve";
import { resolveHandlers } from "@/handlers/resolve";
import { normalizeRegistry } from "@/registry/normalize";
import type { RenderContext } from "@/render/context";
import { Renderer } from "@/render/renderer";

function Label({ text }: { readonly text: string }) {
  return <span>{text}</span>;
}

const context: RenderContext = {
  registry: normalizeRegistry({ Label }),
  handlers: resolveHandlers([]),
  data: resolveData([]),
  cache: createDataCache(),
  fallback: (error) => <div>{error.message}</div>,
  loadingFallback: () => <div>loading</div>,
};

describe("Renderer", () => {
  it("renders a document's root", () => {
    render(
      <Renderer
        document={{
          version: 1,
          root: { type: "Label", props: { text: "hi" } },
        }}
        ctx={context}
      />
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("accepts a bare root node", () => {
    render(
      <Renderer
        document={{ type: "Label", props: { text: "bare" } }}
        ctx={context}
      />
    );
    expect(screen.getByText("bare")).toBeInTheDocument();
  });
});
