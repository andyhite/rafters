# Rafters

Describe React component trees and applications as JSON — register your components with
schemas, validate config, generate a capability manifest, and render it. Built for
data-driven and agent-authored UIs.

## Install

    npm install @andyhite/rafters

## Register components

    import { createRafters } from "@andyhite/rafters";
    import { zodJsonSchemaAdapter } from "@andyhite/rafters/zod-adapter";
    import { z } from "zod";

    export const rafters = createRafters({
      version: 1,
      components: {
        Heading: { component: Heading, describe: "A heading", props: z.object({ text: z.string() }) },
        Button:  { component: Button, props: z.object({ label: z.string() }) },
      },
      handlers: {
        greet: (ctx, name) => console.log("hi", name, ctx.scope),
      },
      jsonSchemaAdapter: zodJsonSchemaAdapter,
    });

A component may also be registered bare (`Heading` instead of `{ component: Heading }`):
it renders, but is omitted from the manifest and skips prop validation.

## Render a document

    <rafters.Renderer
      document={{
        version: 1,
        root: { type: "Button", props: { label: "Go", onClick: { $handler: "greet", args: ["Ada"] } } },
      }}
      scope={{ currentUser }}
    />

Props may be JSON primitives, nested nodes, arrays of nodes, or `{ $handler }` references.
Handlers receive `(ctx, ...boundArgs, ...eventArgs)` where `ctx.scope` is the `scope` prop.

## Manifest & validation

    rafters.manifest();                 // capability description for an agent
    rafters.validate(document);         // { ok } | { ok: false, issues: [{ path, code, message, suggestion? }] }
    rafters.serialize(document);        // validates, returns JSON
    rafters.deserialize(jsonString);    // parses, migrates, validates

## License

MIT
