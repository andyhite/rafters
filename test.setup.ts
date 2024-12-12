import { cleanup } from "@testing-library/react";
import { useEffect, useState } from "react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

vi.mock("@storybook/preview-api", () => ({
  useState,
  useEffect,
}));
