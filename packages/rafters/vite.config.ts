import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/__stories__/**"],
    }),
  ],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: {
        rafters: resolve(import.meta.dirname, "src/index.ts"),
        "zod-adapter": resolve(import.meta.dirname, "src/zod-adapter.ts"),
      },
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "react-dom/client", "zod"],
    },
  },
});
