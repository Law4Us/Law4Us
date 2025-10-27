"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component
 * Catches React errors and shows a friendly error message
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-lightest p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-h1 font-bold mb-2 text-neutral-darkest">
                משהו השתבש
              </h1>
              <p className="text-body text-neutral-dark mb-6">
                אירעה שגיאה בלתי צפויה. אנא נסו שנית או חזרו לדף הבית.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-right">
                <p className="text-body-small font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} size="lg">
                <RefreshCw className="w-4 h-4 ml-1" />
                נסה שנית
              </Button>
              <Button variant="outline" onClick={this.handleGoHome} size="lg">
                <Home className="w-4 h-4 ml-1" />
                חזרה לדף הבית
              </Button>
            </div>

            <p className="text-body-small text-neutral-dark mt-6">
              אם הבעיה נמשכת, אנא צרו קשר:{" "}
              <a
                href="tel:0545882736"
                className="text-primary hover:underline font-medium"
              >
                054-588-2736
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
