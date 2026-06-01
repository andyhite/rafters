import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "@/render/error-boundary";

function Boom(): React.ReactNode {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("renders a fallback when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary
        fallback={(error) => <div role="alert">{error.message}</div>}
      >
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    spy.mockRestore();
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary fallback={() => <div>err</div>}>
        <div>ok</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
