import { Stack, Typography } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react";

import { Json, Panel, rafters } from "./shared";

/**
 * `rafters.manifest()` emits a capability description: every schema-bearing
 * component with its JSON Schema (via the Zod adapter) and `childProps`, plus
 * the registered handlers — including the described, arg-schema'd `greet` from
 * the custom handler source. Bare components (like `Badge`) are omitted.
 */
const meta = {
  title: "Rafters/Manifest",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const CapabilityManifest: Story = {
  name: "Generated manifest",
  render: () => (
    <Panel title="rafters.manifest()">
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          This is exactly what an agent receives so it knows which components
          and handlers exist and how their props are shaped.
        </Typography>
        <Json value={rafters.manifest()} />
      </Stack>
    </Panel>
  ),
};
