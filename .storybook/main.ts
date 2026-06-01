import { resolve } from "node:path";

import { withoutVitePlugins } from "@storybook/builder-vite";
import { type StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../packages/rafters/src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.plugins = await withoutVitePlugins(config.plugins, ["vite:dts"]);

    return mergeConfig(config, {
      mode: "storybook",
      resolve: {
        alias: {
          "@": resolve(process.cwd(), "packages/rafters/src"),
        },
      },
      build: {
        chunkSizeWarningLimit: 1600,
        minify: false,
        terserOptions: {
          compress: false,
          mangle: false
        }
      }
    });
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false
      },
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent
          ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName)
          : true,
    }
  }
};
export default config;
