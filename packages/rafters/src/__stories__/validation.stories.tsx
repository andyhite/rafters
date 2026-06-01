import { Chip, Stack, Typography } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Json, Panel, rafters } from "./shared";

/**
 * `rafters.validate(doc)` returns `{ ok: true }` or `{ ok: false, issues }`,
 * where each issue carries a `path`, a stable `code`, a message, and — for
 * unknown components/handlers — a did-you-mean `suggestion`. Reserved
 * expression shapes (`$expr`, `$bind`, …) are rejected as unsupported in v1.
 */
const meta = {
  title: "Rafters/Validation",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const cases: Array<{ title: string; document: unknown }> = [
  {
    title: "Valid document",
    document: {
      version: 1,
      root: { type: "Heading", props: { text: "All good" } },
    },
  },
  {
    title: "Unknown component (typo → suggestion)",
    document: { version: 1, root: { type: "Headng", props: { text: "x" } } },
  },
  {
    title: "Invalid prop type",
    document: { version: 1, root: { type: "Heading", props: { text: 42 } } },
  },
  {
    title: "Unknown handler (typo → suggestion)",
    document: {
      version: 1,
      root: {
        type: "ActionButton",
        props: { label: "Go", onClick: { $handler: "lgo" } },
      },
    },
  },
  {
    title: "Reserved expression shape (unsupported in v1)",
    document: {
      version: 1,
      root: { type: "Heading", props: { text: { $expr: "user.name" } } },
    },
  },
];

export const ValidationResults: Story = {
  name: "Issues & suggestions",
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      {cases.map(({ title, document }) => {
        const result = rafters.validate(document);
        return (
          <Panel key={title} title={title}>
            <Stack spacing={1}>
              <Chip
                size="small"
                color={result.ok ? "success" : "error"}
                label={result.ok ? "ok" : `${result.issues.length} issue(s)`}
                sx={{ alignSelf: "flex-start" }}
              />
              {result.ok ? (
                <Typography variant="body2" color="text.secondary">
                  Document passed validation.
                </Typography>
              ) : (
                <Json value={result.issues} />
              )}
            </Stack>
          </Panel>
        );
      })}
    </Stack>
  ),
  async play({ canvasElement }) {
    const canvas = within(canvasElement);

    // did-you-mean suggestion for the component typo
    await expect(canvas.getByText(/"unknown_component"/)).toBeInTheDocument();
    await expect(
      canvas.getByText(/"suggestion": "Heading"/)
    ).toBeInTheDocument();
    // reserved shape is reported as unsupported
    await expect(canvas.getByText(/"unsupported_feature"/)).toBeInTheDocument();
  },
};
