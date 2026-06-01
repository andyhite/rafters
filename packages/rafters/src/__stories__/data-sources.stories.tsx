import { CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { z } from "zod";

import { Json, Panel, SplitView } from "./shared";

import { createRafters } from "@/create-rafters";
import { zodJsonSchemaAdapter } from "@/zod-adapter";

type Order = { id: number; label: string };

function OrderList({ orders }: { readonly orders?: Order[] }) {
  return (
    <List dense>
      {(orders ?? []).map((order) => (
        <ListItem key={order.id}>
          <ListItemText primary={order.label} />
        </ListItem>
      ))}
    </List>
  );
}

const rafters = createRafters({
  version: 1,
  components: {
    OrderList: {
      component: OrderList,
      describe: "Renders a list of orders.",
    },
  },
  data: {
    async listOrders() {
      await new Promise((resolve) => {
        setTimeout(resolve, 300);
      });
      return [
        { id: 1, label: "Order #1 — shipped" },
        { id: 2, label: "Order #2 — pending" },
        { id: 3, label: "Order #3 — delivered" },
      ];
    },
  },
  dataSources: [
    {
      id: "demo-resources",
      list: () => [
        {
          name: "search",
          describe: "Search orders by status.",
          args: z.object({ status: z.string() }),
          load: () => [],
        },
      ],
    },
  ],
  jsonSchemaAdapter: zodJsonSchemaAdapter,
  loadingFallback: () => <CircularProgress size={20} />,
});

const meta = {
  title: "Rafters/Data Sources",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const LoadAndRender: Story = {
  name: "Load & render (async)",
  render: () => (
    <SplitView
      left={
        <Panel title="Rendered (loads via $data)">
          <rafters.Renderer
            document={{
              version: 1,
              root: {
                type: "OrderList",
                props: { orders: { $data: "listOrders" } },
              },
            }}
          />
        </Panel>
      }
      right={
        <Panel title="manifest().data">
          <Json value={rafters.manifest().data} />
        </Panel>
      }
    />
  ),
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Order #1 — shipped")
    ).toBeInTheDocument();
    await expect(canvas.getByText("Order #3 — delivered")).toBeInTheDocument();
  },
};
