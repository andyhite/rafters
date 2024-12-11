import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    dts({ rollupTypes: true }),
    storybookTest({
      storybookScript: "pnpm storybook --ci",
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "@andyhite/rafters",
    },
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "react-dom/client": "ReactDOMClient",
        },
      },
      onwarn(warning, defaultHandler) {
        if (
          warning.code &&
          ["SOURCEMAP_BROKEN", "SOURCEMAP_ERROR"].includes(warning.code)
        ) {
          return;
        }

        defaultHandler(warning);
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.tsx"],
    setupFiles: ["./test.setup.ts", "./.storybook/vitest.setup.ts"],
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
      headless: true,
    },
    isolate: false,
  },
});
