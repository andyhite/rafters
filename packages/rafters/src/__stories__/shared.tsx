import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack as MuiStack,
  Typography,
} from "@mui/material";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type ReactNode } from "react";
import { z } from "zod";

import { createRafters } from "@/create-rafters";
import type { HandlerSource } from "@/handlers/types";
import { zodJsonSchemaAdapter } from "@/zod-adapter";

/* ------------------------------------------------------------------ *
 * Demo components — the building blocks an agent would compose into a
 * document. Some carry Standard Schemas (validated + surfaced in the
 * manifest); `Badge` is registered bare; `Boom` always throws.
 * ------------------------------------------------------------------ */

function Stack({ children }: { readonly children?: ReactNode }) {
  return <MuiStack spacing={1.5}>{children}</MuiStack>;
}

function Card({
  title,
  children,
}: {
  readonly title: string;
  readonly children?: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Paper>
  );
}

function Heading({ text }: { readonly text: string }) {
  return <Typography variant="h6">{text}</Typography>;
}

function Paragraph({ text }: { readonly text: string }) {
  return <Typography variant="body2">{text}</Typography>;
}

function ActionButton({
  label,
  color = "primary",
  onClick,
}: {
  readonly label: string;
  readonly color?: "primary" | "secondary";
  readonly onClick?: () => void;
}) {
  return (
    <Button variant="contained" color={color} onClick={onClick}>
      {label}
    </Button>
  );
}

function Badge({ text }: { readonly text?: string }) {
  return <Chip size="small" label={text ?? "badge"} />;
}

function Boom(): ReactNode {
  throw new Error("Boom: this component always throws");
}

/* ------------------------------------------------------------------ *
 * A custom handler source — the seam a future MCP integration plugs
 * into. It supplies a described handler whose args carry a schema, so
 * the handler shows up fully-typed in the manifest.
 * ------------------------------------------------------------------ */

const greetArgs = z.tuple([z.string()]) as unknown as StandardSchemaV1;

export const demoToolsSource: HandlerSource = {
  id: "demo-tools",
  list: () => [
    {
      name: "greet",
      describe: "Show a greeting alert for the given name.",
      args: greetArgs,
      handler(_context, name) {
        // eslint-disable-next-line no-alert
        globalThis.alert(`Hello, ${String(name)}!`);
      },
    },
  ],
};

/* ------------------------------------------------------------------ *
 * The configured runtime, shared across stories.
 *  - `log` reads a function off `scope` so stories can observe calls.
 *  - `greet` comes from the custom source above.
 * ------------------------------------------------------------------ */

export const rafters = createRafters({
  version: 1,
  components: {
    Stack: { component: Stack, childProps: ["children"] },
    Card: {
      component: Card,
      describe: "A titled, outlined surface.",
      props: z.object({ title: z.string() }),
      childProps: ["children"],
    },
    Heading: {
      component: Heading,
      describe: "A section heading.",
      props: z.object({ text: z.string() }),
    },
    Paragraph: {
      component: Paragraph,
      describe: "A paragraph of body text.",
      props: z.object({ text: z.string() }),
    },
    ActionButton: {
      component: ActionButton,
      describe: "A button that can dispatch a handler.",
      props: z.object({
        label: z.string(),
        color: z.enum(["primary", "secondary"]).optional(),
      }),
    },
    Badge, // registered bare: renders, but skips validation + manifest
  },
  handlers: {
    log(context, message) {
      const sink = context.scope.log;
      if (typeof sink === "function") sink(message);
    },
  },
  sources: [demoToolsSource],
  jsonSchemaAdapter: zodJsonSchemaAdapter,
});

/* The throwing component lives in its own single-component runtime so the
 * "happy path" manifest above stays clean. */
export const raftersWithBoom = createRafters({
  version: 1,
  components: {
    Stack: { component: Stack, childProps: ["children"] },
    Heading: {
      component: Heading,
      props: z.object({ text: z.string() }),
    },
    Boom,
  },
  fallback: (error) => (
    <Alert severity="error" variant="outlined">
      Node failed to render: {error.message}
    </Alert>
  ),
});

/* ------------------------------------------------------------------ *
 * Small presentational helpers for the "inspector" stories.
 * ------------------------------------------------------------------ */

export function Panel({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Typography gutterBottom variant="subtitle2">
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export function Json({ value }: { readonly value: unknown }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1.5,
        bgcolor: "grey.100",
        borderRadius: 1,
        fontSize: 12,
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Box>
  );
}

export function SplitView({
  left,
  right,
}: {
  readonly left: ReactNode;
  readonly right: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2,
        alignItems: "start",
        maxWidth: 980,
      }}
    >
      {left}
      {right}
    </Box>
  );
}
