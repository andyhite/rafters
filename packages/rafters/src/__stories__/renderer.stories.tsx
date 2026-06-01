import { type Meta, type StoryObj } from "@storybook/react";

import { rafters } from "./shared";

import type { RaftersDocument } from "@/types";

/**
 * The renderer walks a serialized document and renders registered components.
 * Props may be JSON primitives, nested nodes, or arrays of nodes.
 */
const meta = {
  title: "Rafters/Renderer",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function show(document: RaftersDocument) {
  return () => <rafters.Renderer document={document} />;
}

export const Basic: Story = {
  name: "Basic primitives",
  render: show({
    version: 1,
    root: {
      type: "Heading",
      props: { text: "Hello from a serialized document" },
    },
  }),
};

export const Nested: Story = {
  name: "Nested nodes",
  render: show({
    version: 1,
    root: {
      type: "Card",
      props: {
        title: "Profile",
        children: { type: "Heading", props: { text: "Ada Lovelace" } },
      },
    },
  }),
};

export const ArrayOfChildren: Story = {
  name: "Arrays of children",
  render: show({
    version: 1,
    root: {
      type: "Stack",
      props: {
        children: [
          { type: "Heading", key: "h", props: { text: "Reading list" } },
          {
            type: "Paragraph",
            key: "p1",
            props: { text: "1. The Annotated Turing" },
          },
          {
            type: "Paragraph",
            key: "p2",
            props: { text: "2. Gödel, Escher, Bach" },
          },
          {
            type: "Paragraph",
            key: "p3",
            props: { text: "3. Structure & Interpretation" },
          },
        ],
      },
    },
  }),
};

/**
 * `Badge` is registered bare (`Badge` rather than `{ component: Badge }`): it
 * renders, but is skipped by prop validation and omitted from the manifest.
 */
export const BareComponent: Story = {
  name: "Bare (schema-less) component",
  render: show({
    version: 1,
    root: {
      type: "Stack",
      props: {
        children: [
          { type: "Heading", key: "h", props: { text: "Status" } },
          { type: "Badge", key: "b", props: { text: "shipped" } },
        ],
      },
    },
  }),
};
