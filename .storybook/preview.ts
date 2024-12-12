import type { Decorator, Parameters, Preview } from "@storybook/react";
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';

import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/material-icons';

export const decorators: Decorator[] = [
  withThemeFromJSXProvider({
    themes: {
      default: createTheme(),
    },
    defaultTheme: "default",
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline
  })
];

export const parameters: Parameters = {
  tontrols: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
