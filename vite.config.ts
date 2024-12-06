import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "@andyhite/rafters",
    },
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["test.setup.ts"],
  },
});
