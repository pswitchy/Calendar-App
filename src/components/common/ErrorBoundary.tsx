// src/components/common/ErrorBoundary.tsx

'use client';

import { Component, ReactNode } from 'react';
import { captureException } from '@sentry/nextjs'; // Optional error monitoring

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // Additional error context
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      captureException(error, { 
        contexts: { react: { componentStack: errorInfo.componentStack } },
        tags: { error_boundary_context: this.props.context }
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Consider adding additional reset logic here if needed
  };

  renderFallback() {
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        role="alert"
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            ⚠️ Application Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {this.props.context && `[${this.props.context}] `}
            Something unexpected occurred. Our team has been notified.
          </p>
          
          {process.env.NODE_ENV !== 'production' && (
            <details className="mb-4">
              <summary className="text-sm cursor-pointer text-gray-500">
                Debug Information
              </summary>
              <pre className="mt-2 text-xs text-red-500 overflow-auto">
                {this.state.error?.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}