"use client";
import React, { Component, ReactNode } from "react";
import { T } from "@/lib/theme/tokens";
import { Btn } from "@/components/ui/base";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          padding: 40, textAlign: "center", minHeight: 300,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: T.text }}>Something went wrong</h3>
          <p style={{ fontSize: 14, color: T.textSec, marginBottom: 20, maxWidth: 400, lineHeight: 1.6 }}>
            An unexpected error occurred. This has been logged. Please try refreshing the page.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => this.setState({ hasError: false, error: null })}>Try Again</Btn>
            <Btn variant="ghost" onClick={() => window.location.reload()}>Refresh Page</Btn>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre style={{
              marginTop: 20, padding: 16, background: T.surface, borderRadius: 8,
              fontSize: 11, color: T.coral, textAlign: "left", maxWidth: 500, overflow: "auto",
              border: `1px solid ${T.error}`,
            }}>
              {this.state.error.message}
              {"\n"}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
