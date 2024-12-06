import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest"; // eslint-disable-line import/no-unassigned-import

afterEach(() => {
  cleanup();
});
