import { Stack, Typography } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react";
import { z } from "zod";

import { Json, Panel, rafters, SplitView } from "./shared";

import { createRafters } from "@/create-rafters";
import type { RaftersDocument } from "@/types";

/**
 * `serialize` validates a document and returns JSON; `deserialize` parses,
 * runs the version-migration hook, then validates — so a document can only
 * cross the wire if it conforms to the current contract.
 */
const meta = {
  title: "Rafters/Serialization",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const document: RaftersDocument = {
  version: 1,
  root: {
    type: "Card",
    props: {
      title: "Saved view",
      children: {
        type: "Paragraph",
        props: { text: "Round-trips losslessly." },
      },
    },
  },
};

const serialized = rafters.serialize(document);
const restored = rafters.deserialize(serialized);

export const RoundTrip: Story = {
  name: "Serialize / deserialize",
  render: () => (
    <SplitView
      left={
        <Panel title="serialize(document) → string">
          <Json value={serialized} />
        </Panel>
      }
      right={
        <Panel title="deserialize(string) → document">
          <Stack spacing={1}>
            <Json value={restored} />
            <Typography variant="caption" color="text.secondary">
              Deep-equals the original:{" "}
              {String(JSON.stringify(restored) === JSON.stringify(document))}
            </Typography>
          </Stack>
        </Panel>
      }
    />
  ),
};

/**
 * A migrating runtime upgrades older documents on read. Here the hook bumps a
 * `version: 0` document to the current version before validation runs.
 */
function Heading({ text }: { readonly text: string }) {
  return <Typography variant="h6">{text}</Typography>;
}

const migratingRafters = createRafters({
  version: 1,
  components: {
    Heading: { component: Heading, props: z.object({ text: z.string() }) },
  },
  migrate(raw) {
    const candidate = raw as { version?: number };
    return candidate.version === 0 ? { ...candidate, version: 1 } : candidate;
  },
});

const legacyDocument = {
  version: 0,
  root: { type: "Heading", props: { text: "Authored against v0" } },
};

const legacyJson = JSON.stringify(legacyDocument);
const upgraded = migratingRafters.deserialize(legacyJson);

export const Migration: Story = {
  name: "Version migration on read",
  render: () => (
    <SplitView
      left={
        <Panel title="Stored document (version 0)">
          <Json value={legacyDocument} />
        </Panel>
      }
      right={
        <Panel title="After deserialize() — migrated to v1">
          <Json value={upgraded} />
        </Panel>
      }
    />
  ),
};
