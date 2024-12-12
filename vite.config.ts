import { resolve } from "node:path";

import { ExtractorLogLevel } from "@microsoft/api-extractor";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import react from "@vitejs/plugin-react";
import chalk, { type ForegroundColorName } from "chalk";
import { isArray } from "lodash-es";
import type { LogLevel } from "rollup";
import { createLogger } from "vite";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const logger = createLogger();

  const loggerInfo = logger.info;
  const loggerWarn = logger.warn;
  const loggerError = logger.error;

  logger.info = (message, options) => {
    loggerInfo(`${chalk.cyan("vite")} ${message}`, options);
  };

  logger.warn = (message, options) => {
    loggerWarn(`${chalk.cyan("vite")} ${message}`, options);
  };

  logger.error = (message, options) => {
    loggerError(`${chalk.cyan("vite")} ${message}`, options);
  };

  return {
    customLogger: logger,
    plugins: [
      dts({
        logLevel: "silent",
        rollupTypes: true,
        rollupOptions: {
          messageCallback(message) {
            if (message.logLevel === ExtractorLogLevel.Info) {
              message.logLevel = ExtractorLogLevel.None;
            }
          },
        },
      }),
      react(),
      storybookTest({
        storybookScript: "pnpm storybook --ci",
      }),
    ].filter((plugin) => {
      if (!isArray(plugin) && plugin.name === "vite-plugin-storybook-test") {
        return ["storybook", "test"].includes(mode);
      }

      return true;
    }),
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
        external: [
          "react",
          "react/jsx-runtime",
          "react-dom",
          "react-dom/client",
        ],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
            "react-dom/client": "ReactDOMClient",
          },
        },
        onLog(level, log, defaultHandler) {
          const logLevelToColor: Record<LogLevel, ForegroundColorName> = {
            info: "gray",
            warn: "yellow",
            debug: "blue",
          };

          const prefix = log.plugin
            ? `vite:${log.plugin?.replace(/vite-plugin-/, "")}`
            : "vite";
          const description = log.message?.replace(/^\[.*]\s?/, "");

          log.message = `${chalk.cyan(prefix)} ${chalk[logLevelToColor[level]](description)}`;

          defaultHandler(level, log);
        },
        onwarn(warning, defaultHandler) {
          if (warning.code === "CIRCULAR_DEPENDENCY") {
            loggerWarn(warning.message);
          } else {
            defaultHandler(warning);
          }
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      coverage: {
        provider: "v8",
      },
      include: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.stories.tsx",
      ],
      setupFiles: ["./test.setup.ts", "./.storybook/vitest.setup.ts"],
      browser: {
        enabled: true,
        name: "chromium",
        provider: "playwright",
        headless: true,
      },
      isolate: false,
    },
  };
});
