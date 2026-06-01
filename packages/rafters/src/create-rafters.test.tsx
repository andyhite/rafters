import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createRafters } from "@/create-rafters";
import { zodJsonSchemaAdapter } from "@/zod-adapter";

function Heading({ text }: { readonly text: string }) {
  return <h1>{text}</h1>;
}

function Button({
  label,
  onClick,
}: {
  readonly label: string;
  readonly onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
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

function setup() {
  return createRafters({
    version: 1,
    components: {
      Heading: {
        component: Heading,
        describe: "Heading",
        props: z.object({ text: z.string() }),
      },
      Button: { component: Button, props: z.object({ label: z.string() }) },
    },
    handlers: { greet: vi.fn() },
    jsonSchemaAdapter: zodJsonSchemaAdapter,
  });
}

describe("createRafters", () => {
  it("loads data via a registered source and lists it in the manifest", async () => {
    const r = createRafters({
      version: 1,
      components: { List: { component: List } },
      data: { items: async () => ["x", "y"] },
    });

    expect(r.manifest().data).toEqual([{ name: "items" }]);
    expect(
      r.validate({
        version: 1,
        root: { type: "List", props: { items: { $data: "items" } } },
      }).ok
    ).toBe(true);

    render(
      <r.Renderer
        document={{
          version: 1,
          root: { type: "List", props: { items: { $data: "items" } } },
        }}
      />
    );
    expect(await screen.findByText("x")).toBeInTheDocument();
    expect(screen.getByText("y")).toBeInTheDocument();
  });

  it("emits a manifest", () => {
    const r = setup();
    const manifest = r.manifest();
    expect(manifest.version).toBe(1);
    expect(manifest.components.map((c) => c.type).sort()).toEqual([
      "Button",
      "Heading",
    ]);
    expect(manifest.handlers).toEqual([{ name: "greet" }]);
  });

  it("validates documents", () => {
    const r = setup();
    expect(
      r.validate({
        version: 1,
        root: { type: "Heading", props: { text: "Hi" } },
      }).ok
    ).toBe(true);
    expect(
      r.validate({ version: 1, root: { type: "Heading", props: { text: 1 } } })
        .ok
    ).toBe(false);
  });

  it("renders and dispatches handlers", () => {
    const greet = vi.fn();
    const r = createRafters({
      version: 1,
      components: {
        Button: { component: Button, props: z.object({ label: z.string() }) },
      },
      handlers: { greet },
    });
    render(
      <r.Renderer
        document={{
          version: 1,
          root: {
            type: "Button",
            props: { label: "Go", onClick: { $handler: "greet" } },
          },
        }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(greet).toHaveBeenCalledTimes(1);
  });

  it("round-trips serialize/deserialize", () => {
    const r = setup();
    const document = {
      version: 1,
      root: { type: "Heading", props: { text: "Hi" } },
    } as const;
    expect(r.deserialize(r.serialize(document))).toEqual(document);
  });
});
