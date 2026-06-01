import { Component, type ReactNode } from "react";

type Props = {
  readonly fallback: (error: Error) => ReactNode;
  readonly children: ReactNode;
};
type State = { error: Error | undefined };

export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override state: State = { error: undefined };

  override render(): ReactNode {
    return this.state.error
      ? this.props.fallback(this.state.error)
      : this.props.children;
  }
}
