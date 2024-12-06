import { render, screen } from "@testing-library/react";
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
  TextFieldElement,
  TextareaAutosizeElement,
  ToggleButtonGroupElement,
} from "react-hook-form-mui";
import { createRafters, type CreateRaftersReturn } from "../rafters";

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

describe("App", () => {
  it("renders the App component", () => {
    render(<Rafters.Renderer schema={(Builder) => Builder.Fieldset()} />);

    screen.debug();
  });
});
