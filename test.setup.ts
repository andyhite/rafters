import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest"; // eslint-disable-line import/no-unassigned-import
import React from "react";

afterEach(() => {
  cleanup();
});

vi.mock("@storybook/preview-api", () => ({
  useState: React.useState,
  useEffect: React.useEffect,
}));
