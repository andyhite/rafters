/* eslint-disable react-hooks/rules-of-hooks */
import { Box, Button, Typography } from "@mui/material";
import { action } from "@storybook/addon-actions";
import { useState } from "@storybook/preview-api";
import { type Meta, type StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { useForm, type UseFormReturn } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";

import { createRafters } from "../core/create-rafters";

type AppLayoutProps = {
  readonly children: React.ReactNode;
};

type PageLayoutProps = {
  readonly heading: React.ReactNode;
  readonly children: React.ReactNode;
};

type HeadingProps = {
  readonly children: React.ReactNode;
};

type FormProps = {
  readonly onSubmit: (data: Record<string, any>) => void;
  readonly children: React.ReactNode;
};

type FieldProps = {
  readonly children: React.ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
      {children}
    </Box>
  );
}

function PageLayout({ heading, children }: PageLayoutProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ mb: 2 }}>{heading}</Box>
      {children}
    </Box>
  );
}

function Heading({ children }: HeadingProps) {
  return <Typography variant="h6">{children}</Typography>;
}

function Form({ onSubmit, children }: FormProps) {
  const formMethods: UseFormReturn = useForm();

  return (
    <FormContainer
      formContext={formMethods}
      onSuccess={(data) => {
        onSubmit(data);
      }}
    >
      {children}

      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </FormContainer>
  );
}

function Field({ children }: FieldProps) {
  return <Box sx={{ mb: 2 }}>{children}</Box>;
}

const Rafters = createRafters({
  AppLayout,
  PageLayout,
  Heading,
  Form,
  Field,
  TextFieldElement,
});

const meta: Meta<typeof Rafters.Renderer> = {
  title: "Rafters.Renderer",
  component: Rafters.Renderer,
};

export default meta;

type Story = StoryObj<typeof Rafters.Renderer>;

export const Example: Story = {
  render() {
    const title = "My Form";

    const [values, setValues] = useState<Record<string, any>>({});

    return (
      <Box>
        <Box data-testid="form">
          <Rafters.Renderer
            scope={{ action, title, setValues }}
            schema={(Builder) =>
              Builder.AppLayout({
                children: Builder.PageLayout({
                  heading: Builder.Heading({
                    children: title,
                  }),
                  children: Builder.Form({
                    onSubmit: Builder.Callback((data) => {
                      setValues(data);
                      action(`[React Hook Form] Submit`)(data);
                    }),
                    children: [
                      Builder.Field({
                        key: "field-1",
                        children: Builder.TextFieldElement({
                          label: "First name",
                          name: "firstName",
                          onChange: Builder.Callback((event) => {
                            action(`[React Hook Form] Change (firstName)`)(
                              event
                            );
                          }),
                        }),
                      }),
                      Builder.Field({
                        key: "field-2",
                        children: Builder.TextFieldElement({
                          label: "Last name",
                          name: "lastName",
                          onChange: Builder.Callback((event) => {
                            action(`[React Hook Form] Change (lastName)`)(
                              event
                            );
                          }),
                        }),
                      }),
                    ],
                  }),
                }),
              })
            }
          />
        </Box>
        <Box
          sx={{ mt: 2, p: 2, border: "1px solid #ccc", borderRadius: 1 }}
          data-testid="values"
        >
          <Typography variant="h6">Values</Typography>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Box>
      </Box>
    );
  },
  async play({ canvasElement }) {
    const form = within(canvasElement).getByTestId("form");
    const values = within(canvasElement).getByTestId("values");

    const firstNameInput = within(form).getByLabelText("First name");
    const lastNameInput = within(form).getByLabelText("Last name");

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");

    await expect(firstNameInput).toHaveValue("John");
    await expect(lastNameInput).toHaveValue("Doe");

    await userEvent.click(within(form).getByRole("button", { name: "Submit" }));

    await waitFor(async () => {
      await expect(values).toHaveTextContent("John");
      await expect(values).toHaveTextContent("Doe");
    });
  },
};
