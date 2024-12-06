# Rafters

**Rafters** is a library for React that enables the serialization and deserialization of component trees to and from JSON. This allows you to store a component tree in a database and later restore it for rendering. With support for callbacks and scoped variables, Rafters simplifies the creation of dynamic, data-driven user interfaces.

Common use cases include:

- User-defined form builders.
- Dynamic page editors.
- Interactive dashboards.
- Reusable UI templates.

---

## Installation

Install Rafters using your preferred package manager:

```bash
npm install rafters
```

or

```bash
yarn add rafters
```

---

## Usage

### 1. Register Components

To use Rafters, you need to register the components you want to include in your schemas. This should be done **outside of any React component**. The recommended approach is to call `createRafters` in a separate module file and export the result. This ensures the registration is reusable across your application and gets cached in the application's bundle:

```typescript
// rafters.js
import { createRafters } from 'rafters';

const Rafters = createRafters({
  AppLayout,
  PageLayout,
  Heading,
  Form,
  TextField,
  SelectField,
});

export default Rafters;
```

You can then import and use `Rafters` wherever needed:

```typescript
import Rafters from './rafters';
```

---

### 2. Defining and Rendering Component Trees

#### Defining Component Trees

Component trees are defined using a builder function provided by Rafters. The `schema` property of the `Rafters.Renderer` component accepts either a prebuilt schema object (a JSON tree) or a callback function that receives the builder as an argument. Here’s an example of defining a component tree inline:

```typescript
import Rafters from './rafters';
import { useState } from 'react';

const InlineApp = () => {
  const [_formData, setFormData] = useState({});

  return (
    <Rafters.Renderer
      schema={(Builder) =>
        Builder.AppLayout({
          children: [
            Builder.PageLayout({
              heading: Builder.Heading({ children: 'My Form' }),
              children: [
                Builder.Form({
                  onSubmit: (data) => setFormData(data),
                  children: [
                    Builder.TextField({ label: 'Name', name: 'name' }),
                    Builder.SelectField({
                      label: 'Favourite Colour',
                      name: 'colour',
                      options: [
                        { label: 'Red', value: 'red' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      }
    />
  );
};
```

---

#### Serialized Tree Example

When serialized, the tree from the above example produces the following structure:

```json
{
  "type": "AppLayout",
  "props": {
    "children": [
      {
        "type": "PageLayout",
        "props": {
          "heading": {
            "type": "Heading",
            "props": { "children": "My Form" }
          },
          "children": [
            {
              "type": "Form",
              "props": {
                "onSubmit": {
                  "type": "Callback",
                  "code": "function (data) { setFormData(data); }"
                },
                "children": [
                  { "type": "TextField", "props": { "label": "Name", "name": "name" } },
                  {
                    "type": "SelectField",
                    "props": {
                      "label": "Favourite Colour",
                      "name": "colour",
                      "options": [
                        { "label": "Red", "value": "red" },
                        { "label": "Green", "value": "green" },
                        { "label": "Blue", "value": "blue" }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

The `onSubmit` callback is serialized as a stringified function inside an object with the type `Callback`.

---

#### Rendering a Serialized Tree

To render a serialized schema, pass it to the `Rafters.Renderer` component as the `schema` prop:

```typescript
const SerializedApp = () => {
  return <Rafters.Renderer schema={serializedSchema} />;
};
```

---

### 3. Using Scoped Variables

If the component tree depends on external variables, you can pass these variables to the `Renderer` through the `scope` property. This ensures the deserialized tree has access to them during rendering:

```typescript
const SerializedAppWithScope = () => {
  const [_formData, setFormData] = useState({});

  return (
    <Rafters.Renderer
      scope={{ setFormData }}
      schema={serializedSchema}
    />
  );
};
```

---

### 4. Defining Trees Outside of the Rendered Context

When defining a component tree in a separate context (e.g., for database seeds), any variables that will eventually be passed to the `scope` property must be declared in the scope where the tree is defined. These variables do not need to have assigned values but must be declared to satisfy TypeScript:

```typescript
const setFormData: Dispatch<SetStateAction<string | undefined>>;

const schema = createSchema((Builder) =>
  Builder.AppLayout({
    children: [
      Builder.PageLayout({
        heading: Builder.Heading({ children: 'My Form' }),
        children: [
          Builder.Form({
            onSubmit: (data) => setFormData(data),
            children: [
              Builder.TextField({ label: 'Name', name: 'name' }),
              Builder.SelectField({
                label: "Favourite Colour",
                name: "colour",
                options: [
                  { label: "Red", value: "red" },
                  { label: "Green", value: "green" },
                  { label: "Blue", value: "blue" }
                ]
              }),
            ],
          }),
        ],
      }),
    ],
  })
);
```

This ensures TypeScript recognizes the variables, even if they are only provided during rendering.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a branch for your feature or fix.
3. Commit your changes and ensure they pass existing tests.
4. Open a pull request describing your changes.

Please ensure your code adheres to the existing coding style and includes relevant tests. Feature suggestions and bug reports are also encouraged via the issue tracker.

---

## Supporting the Author

If you find this library helpful and would like to support its development, you can:

- [Buy me a coffee](https://www.buymeacoffee.com)  
- [Sponsor me on GitHub](https://github.com/sponsors)  
- [Thank me on Thanks.dev](https://thanks.dev)

Your support helps me maintain and improve this library. Thank you!

---

## License

Rafters is open-source software licensed under the MIT License. See the LICENSE file for more details.
