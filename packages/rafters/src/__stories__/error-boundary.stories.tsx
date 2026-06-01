import { type Meta, type StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { Panel, raftersWithBoom } from "./shared";

/**
 * Every node renders inside its own error boundary. When one component throws,
 * only that node is replaced by the configured `fallback` — its siblings render
 * normally, so a single bad node can't take down the whole document.
 */
const meta = {
  title: "Rafters/Error Boundary",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const IsolatedFailure: Story = {
  name: "Failure is isolated",
  render: () => (
    <Panel title="Stack with a throwing middle child">
      <raftersWithBoom.Renderer
        document={{
          version: 1,
          root: {
            type: "Stack",
            props: {
              children: [
                {
                  type: "Heading",
                  key: "before",
                  props: { text: "Renders before" },
                },
                { type: "Boom", key: "boom" },
                {
                  type: "Heading",
                  key: "after",
                  props: { text: "Renders after" },
                },
              ],
            },
          },
        }}
      />
    </Panel>
  ),
  async play({ canvasElement }) {
    const canvas = within(canvasElement);

    // Siblings render…
    await expect(canvas.getByText("Renders before")).toBeInTheDocument();
    await expect(canvas.getByText("Renders after")).toBeInTheDocument();
    // …and the throwing node shows the fallback instead of crashing the tree.
    await expect(canvas.getByText(/Node failed to render/)).toBeInTheDocument();
  },
};
