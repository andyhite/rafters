# Rafters

**Rafters** is a serializable runtime for React. You register your components (optionally
with schemas), and Rafters lets you describe trees of them as plain JSON that can be stored,
transmitted, validated, and rendered. Dynamic behavior and data loading flow through typed,
named seams — there is **no `eval`, no `sandboxjs`, and no stringified-function callbacks** —
so documents are safe to author programmatically, including by an LLM agent working from a
known component vocabulary.

Common use cases:

- Agent-authored / generative UI from a known component catalog
- User-defined form builders, dynamic page editors, interactive dashboards
- Reusable, data-driven UI templates persisted as JSON

The published library is [`@andyhite/rafters`](packages/rafters) (this repo is a
pnpm-workspace monorepo; see [Development](#development)).

---

## Install

```bash
npm install @andyhite/rafters
```

Prop and argument schemas use [Standard Schema](https://standardschema.dev), so you bring
your own validator (Zod, Valibot, ArkType, …). The JSON-Schema generation used by the
manifest ships as a Zod adapter on a subpath:

```bash
npm install zod   # only if you use the Zod adapter
```

---

## Quick start

Register your components once, outside of React, and export the result:

```ts
// rafters.ts
import { createRafters } from "@andyhite/rafters";
import { zodJsonSchemaAdapter } from "@andyhite/rafters/zod-adapter";
import { z } from "zod";

export const rafters = createRafters({
  version: 1,
  components: {
    Heading: { component: Heading, describe: "A heading", props: z.object({ text: z.string() }) },
    Button: { component: Button, props: z.object({ label: z.string() }) },
    OrderList: { component: OrderList, describe: "Renders a list of orders" },
  },
  handlers: {
    greet: (ctx, name) => console.log("hi", name, ctx.scope),
  },
  data: {
    listOrders: async (ctx) => fetchOrders(ctx.scope.userId),
  },
  jsonSchemaAdapter: zodJsonSchemaAdapter,
});
```

Then render a document:

```tsx
<rafters.Renderer
  document={{
    version: 1,
    root: {
      type: "Heading",
      props: { text: "Hello from serialized JSON" },
    },
  }}
  scope={{ userId: 7 }}
/>
```

A component may also be registered **bare** (`Heading` instead of `{ component: Heading }`):
it renders, but is omitted from the manifest and skips prop validation.

---

## Documents

A document is `{ version, root }`, where each node is `{ type, key?, props? }`. The
`Renderer` also accepts a bare root node. A prop value may be:

- a JSON primitive, object, or array,
- a nested node (or array of nodes),
- a `{ $handler }` reference — dynamic behavior (see [Handlers](#handlers)),
- a `{ $data }` reference — loaded data (see [Data sources](#data-sources)).

```json
{
  "version": 1,
  "root": {
    "type": "Stack",
    "props": {
      "children": [
        { "type": "Heading", "key": "h", "props": { "text": "Orders" } },
        { "type": "OrderList", "key": "o", "props": { "orders": { "$data": "listOrders" } } },
        { "type": "Button", "key": "b", "props": { "label": "Refresh", "onClick": { "$handler": "greet", "args": ["Ada"] } } }
      ]
    }
  }
}
```

> The expression/function shapes `$expr`, `$bind`, `$if`, `$each`, and `$fn` are **reserved**:
> the validator rejects them as unsupported in this version. They are slated for later phases.

---

## Handlers

Handlers are the typed real-code seam for behavior. They are referenced by name and resolved
at render time, never serialized as code.

```ts
handlers: {
  // ctx.scope is the `scope` prop passed to the Renderer
  greet: (ctx, name) => window.alert(`Hello, ${name}!`),
}
```

A handler ref `{ $handler: "greet", args: ["Ada"] }` wired to e.g. `onClick` calls the
handler as `(ctx, ...boundArgs, ...eventArgs)` — here `(ctx, "Ada", clickEvent)`.

Handlers can also come from **pluggable sources** (the seam a future MCP-tools provider plugs
into) via `sources: HandlerSource[]`; names must be unique across sources.

---

## Data sources

Data sources let a document **load** data and render it — the agent references data by name;
Rafters resolves it. Loaders may be sync or async:

```ts
data: {
  listOrders: async (ctx) => fetchOrders(ctx.scope.userId),
}
```

A `{ $data: "listOrders", args? }` reference resolves to whatever the loader returns and
becomes the prop value (e.g. `orders={ $data: "listOrders" }` feeding an `OrderList`). While
an async load is pending, that node suspends behind a configurable loading fallback; if the
loader rejects, the node's error boundary shows the error fallback. Loads are **cached once**
per Rafters instance, keyed by source name + args.

```tsx
const rafters = createRafters({
  // …
  data: { listOrders: async (ctx) => fetchOrders(ctx.scope.userId) },
  loadingFallback: () => <Spinner />,
  fallback: (error) => <Alert>{error.message}</Alert>,
});
```

Like handlers, data sources can be supplied by **pluggable providers** via
`dataSources: DataSource[]` (the seam a future MCP-resources provider plugs into). The
concrete transport (MCP, HTTP, a database) is yours — Rafters only owns the seam, the
`$data` reference, and the render integration.

> Cache identity is the source **name + args** only — not `scope`. Pass anything that should
> affect caching as `args`; `scope` is for ambient context (auth, current user).

---

## Manifest

`rafters.manifest()` emits a capability description — "tool definitions, but for UI" — that
you can hand to an agent so it knows what exists and how props/args are shaped:

```ts
rafters.manifest();
// {
//   version: 1,
//   components: [{ type, describe?, props?, childProps? }, …],   // props as JSON Schema
//   handlers:   [{ name, describe?, args? }, …],
//   data:       [{ name, describe?, args? }, …],
// }
```

JSON Schema for props/args is produced by the configured `jsonSchemaAdapter` (the Zod adapter
is provided; bare/schema-less entries list as just a name).

---

## Validation

`rafters.validate(document)` returns agent-grade, path-anchored errors (with did-you-mean
suggestions for unknown components, handlers, and data sources):

```ts
const result = rafters.validate(document);
// { ok: true } | { ok: false, issues: [{ path, code, message, suggestion? }] }
```

Issue codes include `unknown_component`, `invalid_prop`, `unknown_handler`,
`unknown_data_source`, `invalid_data_args`, and `unsupported_feature` (a reserved shape).
Validation is synchronous — it validates the document and its references; only the actual
data fetch is async, at render time.

---

## Serialize, deserialize, migrate

```ts
const json = rafters.serialize(document);   // validates, then returns JSON
const back = rafters.deserialize(json);      // parses, runs the migrate hook, then validates
```

Provide a `migrate` hook to `createRafters` to upgrade older documents on read (e.g. bump a
`version: 0` document to the current shape before validation).

---

## Authoring with the Builder

`rafters.Builder` is a typed helper for constructing documents in code. Each registered
component becomes a factory (lifting `key` to the top level); `Builder.handler` and
`Builder.data` build references. The output is plain, serializable JSON — identical to
hand-written documents.

```ts
const B = rafters.Builder;

const root = B.Stack({
  children: [
    B.Heading({ key: "h", text: "Orders" }),
    B.OrderList({ key: "o", orders: B.data("listOrders") }),
    B.Button({ key: "b", label: "Greet", onClick: B.handler("greet", "Ada") }),
  ],
});
```

---

## Development

This repository is a pnpm-workspace monorepo. The library lives in
[`packages/rafters`](packages/rafters); Storybook stories live alongside the source.

```bash
pnpm install
pnpm test                 # unit tests (Vitest + Testing Library, jsdom)
pnpm build                # library build (ESM + CJS + types)
pnpm lint                 # xo
pnpm storybook            # run Storybook locally
pnpm build-storybook      # static Storybook build
pnpm test-storybook:ci    # run the stories' play tests (serves the build + Playwright)
```

Tool versions are pinned in `.tool-versions`.

---

## License

MIT © Andrew Hite
