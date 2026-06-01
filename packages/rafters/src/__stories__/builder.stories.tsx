import { type Meta, type StoryObj } from "@storybook/react";

import { Json, Panel, rafters, SplitView } from "./shared";

/**
 * The Builder is a typed authoring helper. Each registered component becomes a
 * factory that lifts `key` to the top level and nests the rest under `props`;
 * `Builder.handler(name, ...args)` produces a `$handler` reference. The result
 * is a plain, serializable node — identical to hand-written JSON.
 */
const meta = {
  title: "Rafters/Builder",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const builder = rafters.Builder;

const root = builder.Stack({
  children: [
    builder.Heading({ key: "h", text: "Authored with the Builder" }),
    builder.Paragraph({
      key: "p",
      text: 'Builder.handler("greet", "Ada") becomes a $handler reference.',
    }),
    builder.ActionButton({
      key: "a",
      label: "Greet Ada",
      onClick: builder.handler("greet", "Ada"),
    }),
  ],
});

export const AuthoringWithBuilder: Story = {
  name: "Author & render",
  render: () => (
    <SplitView
      left={
        <Panel title="Rendered output">
          <rafters.Renderer document={root} />
        </Panel>
      }
      right={
        <Panel title="Produced node (serializable)">
          <Json value={root} />
        </Panel>
      }
    />
  ),
};
