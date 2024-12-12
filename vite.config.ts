import { resolve } from "node:path";

import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

console.log(resolve(import.meta.dirname, "src/components/*"));

export default defineConfig({
  plugins: [
    dts({ rollupTypes: true }),
    react(),
    storybookTest({
      storybookScript: "pnpm storybook --ci",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
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
