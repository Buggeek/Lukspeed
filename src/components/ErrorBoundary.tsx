import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/services/Logger';
import { AlertTriangle, RefreshCw, Copy, Download, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: crypto.randomUUID()
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || crypto.randomUUID();
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log the error
    logger.fatal('REACT_ERROR', error.message, error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      props: this.props,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private copyErrorDetails = async () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      logs: logger.getLogs().slice(0, 10) // Last 10 logs
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      alert('Detalles del error copiados al portapapeles');
    } catch (e) {
      console.error('Failed to copy error details:', e);
    }
  };

  private downloadLogs = () => {
    const logs = logger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lukspeed-logs-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-xl text-red-600">Error de Aplicación</CardTitle>
                <Badge variant="destructive" className="text-xs">
                  ID: {this.state.errorId?.slice(0, 8)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {this.state.error?.message || 'Ha ocurrido un error inesperado'}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Este error ha sido registrado automáticamente. Por favor, intenta una de las siguientes acciones:
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={this.handleReset} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Intentar Nuevamente
                  </Button>
                  
                  <Button onClick={this.handleReload} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recargar Página
                  </Button>
                  
                  <Button onClick={this.copyErrorDetails} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Detalles
                  </Button>
                  
                  <Button onClick={this.downloadLogs} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Logs
                  </Button>
                </div>
              </div>

              {/* Technical Details - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Detalles Técnicos (Desarrollo)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-64">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error?.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error?.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="text-xs text-gray-500">
                Error registrado: {new Date().toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}