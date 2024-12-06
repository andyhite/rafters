import { type Meta, type StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { FormProvider, useForm } from "react-hook-form";
import {
  AutocompleteElement,
  CheckboxButtonGroup,
  CheckboxElement,
  MultiSelectElement,
  PasswordElement,
  PasswordRepeatElement,
  RadioButtonGroup,
  SelectElement,
  SliderElement,
  SwitchElement,
  TextareaAutosizeElement,
  TextFieldElement,
  ToggleButtonGroupElement,
} from "react-hook-form-mui";
import { createRafters } from "./rafters";

function Fieldset(props: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) {
  return <fieldset {...props} />;
}

const Rafters = createRafters({
  AutocompleteElement,
  CheckboxButtonGroup,
  CheckboxElement,
  Fieldset,
  MultiSelectElement,
  PasswordElement,
  PasswordRepeatElement,
  RadioButtonGroup,
  SelectElement,
  SliderElement,
  SwitchElement,
  TextFieldElement,
  TextareaAutosizeElement,
  ToggleButtonGroupElement,
});

const meta: Meta<typeof Rafters.Renderer> = {
  component: Rafters.Renderer,
  decorators: [
    (Story, { args }) => {
      const form = useForm();

      return (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(action("[React Hook Form] Submit"))}
          >
            <Story args={{ ...args }} />
          </form>
        </FormProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Rafters.Renderer>;

const variableA = "foo";
const variableB = "bar";

export const Primary: Story = {
  args: {
    scope: {
      variableA,
      variableB,
    },
    schema: (Builder) =>
      Builder.Fieldset({
        children: [
          Builder.TextFieldElement({
            name: "firstName",
            label: "First Name",
            onChange: Builder.Callback((event) => {
              console.log(
                `${event.target.value} - ${variableA} - ${variableB}`
              );
            }),
          }),
          Builder.TextFieldElement({
            name: "lastName",
            label: "Last Name",
          }),
        ],
      }),
  },
};
