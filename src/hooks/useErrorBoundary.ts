import { useEffect } from 'react';
import React from 'react';
import { logger } from '@/services/Logger';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorInfo?: any;
}

export const useErrorBoundary = (componentName?: string) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.critical('ui', `Unhandled JavaScript error in ${componentName || 'Unknown Component'}`, event.error, {
        component: componentName,
        data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.critical('ui', `Unhandled Promise rejection in ${componentName || 'Unknown Component'}`, 
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        component: componentName,
        data: {
          reason: event.reason,
          type: 'unhandledrejection'
        }
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [componentName]);

  const logError = (error: Error, errorInfo?: ErrorInfo, context?: any) => {
    logger.critical('ui', `Component error in ${componentName || 'Unknown Component'}`, error, {
      component: componentName,
      data: {
        errorInfo,
        context
      }
    });
  };

  return { logError };
};

// React Error Boundary wrapper
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; componentName?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.critical('ui', `React Error Boundary caught error in ${this.props.componentName || 'Unknown Component'}`, error, {
      component: this.props.componentName,
      data: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <h2 className="text-red-800 font-semibold mb-2">Something went wrong</h2>
          <p className="text-red-600 text-sm">
            An error occurred in {this.props.componentName || 'this component'}. 
            The error has been logged for debugging.
          </p>
          <button
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}