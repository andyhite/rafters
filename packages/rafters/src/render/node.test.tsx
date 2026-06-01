import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createDataCache } from "@/data/cache";
import { inlineDataSource, resolveData } from "@/data/resolve";
import { inlineSource, resolveHandlers } from "@/handlers/resolve";
import { normalizeRegistry } from "@/registry/normalize";
import type { RenderContext } from "@/render/context";
import { RaftersNode } from "@/render/node";

function Box(props: {
  readonly children?: React.ReactNode;
  readonly onClick?: () => void;
  readonly title?: string;
}) {
  return (
    <button type="button" title={props.title} onClick={props.onClick}>
      {props.children}
    </button>
  );
}

function Label({ text }: { readonly text: string }) {
  return <span>{text}</span>;
}

function List({ items }: { readonly items?: string[] }) {
  return (
    <ul>
      {(items ?? []).map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function makeContext(
  handlers = resolveHandlers([]),
  data = resolveData([])
): RenderContext {
  return {
    registry: normalizeRegistry({ Box, Label, List }),
    handlers,
    data,
    cache: createDataCache(),
    fallback: (error) => <div role="alert">{error.message}</div>,
    loadingFallback: () => <div role="status">loading</div>,
  };
}

describe("RaftersNode", () => {
  it("renders primitive props and nested nodes", () => {
    const context = makeContext();
    render(
      <RaftersNode
        node={{
          type: "Box",
          props: {
            title: "t",
            children: { type: "Label", props: { text: "hi" } },
          },
        }}
        scope={{}}
        ctx={context}
      />
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("title", "t");
  });

  it("renders arrays of nodes", () => {
    const context = makeContext();
    render(
      <RaftersNode
        node={{
          type: "Box",
          props: {
            children: [
              { type: "Label", props: { text: "a" } },
              { type: "Label", props: { text: "b" } },
            ],
          },
        }}
        scope={{}}
        ctx={context}
      />
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("wires $handler refs to handlers, passing ctx, bound args, then event args", () => {
    const save = vi.fn();
    const context = makeContext(resolveHandlers([inlineSource({ save })]));
    render(
      <RaftersNode
        node={{
          type: "Box",
          props: {
            onClick: { $handler: "save", args: ["bound"] },
            children: "x",
          },
        }}
        scope={{ userId: 7 }}
        ctx={context}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toEqual({ scope: { userId: 7 } });
    expect(save.mock.calls[0][1]).toBe("bound");
  });

  it("isolates a failing node behind the error boundary", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const context = makeContext();
    render(<RaftersNode node={{ type: "Missing" }} scope={{}} ctx={context} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Missing/);
    spy.mockRestore();
  });

  it("shows the loading fallback then the resolved data", async () => {
    const data = resolveData([
      inlineDataSource({
        items: async () => ["a", "b"],
      }),
    ]);
    const context = makeContext(resolveHandlers([]), data);
    render(
      <RaftersNode
        node={{ type: "List", props: { items: { $data: "items" } } }}
        scope={{}}
        ctx={context}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("loading");
    expect(await screen.findByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("renders the error fallback when a loader rejects", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const data = resolveData([
      inlineDataSource({
        async items() {
          throw new Error("load failed");
        },
      }),
    ]);
    const context = makeContext(resolveHandlers([]), data);
    render(
      <RaftersNode
        node={{ type: "List", props: { items: { $data: "items" } } }}
        scope={{}}
        ctx={context}
      />
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("load failed");
    spy.mockRestore();
  });

  it("passes scope to the loader and resolves a sync loader without suspending", () => {
    const load = vi.fn((dctx: { scope: Record<string, unknown> }) => [
      String(dctx.scope.who),
    ]);
    const data = resolveData([inlineDataSource({ items: load })]);
    const context = makeContext(resolveHandlers([]), data);
    render(
      <RaftersNode
        node={{ type: "List", props: { items: { $data: "items" } } }}
        scope={{ who: "ada" }}
        ctx={context}
      />
    );
    expect(screen.getByText("ada")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
