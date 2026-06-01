import { Box, Stack, Typography } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";

import { Json, Panel, rafters, SplitView } from "./shared";

/**
 * Handlers are referenced by name (`{ $handler }`) and resolved against the
 * registry at render time. They receive `(ctx, ...boundArgs, ...eventArgs)`,
 * where `ctx.scope` is the `scope` prop passed to the renderer. Here every
 * button dispatches the registered `log` handler, which writes to a function
 * supplied through `scope`.
 */
const meta = {
  title: "Rafters/Handlers",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function HandlerPlayground() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <SplitView
      left={
        <Panel title="Rendered document">
          <rafters.Renderer
            scope={{
              log(message: unknown) {
                setLog((l) => [...l, String(message)]);
              },
            }}
            document={{
              version: 1,
              root: {
                type: "Stack",
                props: {
                  children: [
                    {
                      type: "Heading",
                      key: "h",
                      props: { text: "Dispatch a handler" },
                    },
                    {
                      type: "ActionButton",
                      key: "a",
                      props: {
                        label: "Save",
                        // bound arg "saved" is prepended before any event args
                        onClick: { $handler: "log", args: ["saved"] },
                      },
                    },
                    {
                      type: "ActionButton",
                      key: "b",
                      props: {
                        label: "Publish",
                        color: "secondary",
                        onClick: { $handler: "log", args: ["published"] },
                      },
                    },
                  ],
                },
              },
            }}
          />
        </Panel>
      }
      right={
        <Panel title="Handler calls (via scope)">
          {log.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No calls yet — click a button.
            </Typography>
          ) : (
            <Stack spacing={1}>
              <Json value={log} />
              <Box sx={{ fontSize: 13 }}>{`${log.length} call(s)`}</Box>
            </Stack>
          )}
        </Panel>
      }
    />
  );
}

export const ScopeAndBoundArgs: Story = {
  name: "Scope & bound args",
  render: () => <HandlerPlayground />,
  async play({ canvasElement }) {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole("button", { name: "Save" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "Publish" })
    );

    await expect(await canvas.findByText("2 call(s)")).toBeInTheDocument();
    await expect(canvas.getByText(/"saved"/)).toBeInTheDocument();
    await expect(canvas.getByText(/"published"/)).toBeInTheDocument();
  },
};
