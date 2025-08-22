import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/services/Logger';
import { AlertTriangle, Bug, Info, XCircle } from 'lucide-react';

interface ErrorNotificationProps {
  error: Error;
  category?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorNotification({ 
  error, 
  category = 'GENERAL', 
  onRetry, 
  onDismiss 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Log the error
    logger.error(category, error.message, error, {
      component: 'ErrorNotification'
    });

    // Show toast notification
    toast.error(`Error en ${category}`, {
      description: error.message,
      action: onRetry ? {
        label: 'Reintentar',
        onClick: onRetry
      } : undefined,
      duration: 5000
    });
  }, [error, category, onRetry]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-red-900">
            Error en {category}
          </div>
          <div className="text-sm text-red-700 mt-1">
            {error.message}
          </div>
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            )}
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className="text-xs border border-red-300 text-red-700 px-3 py-1 rounded hover:bg-red-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for showing error notifications
export function useErrorNotification() {
  const showError = (error: Error, category?: string, onRetry?: () => void) => {
    logger.error(category || 'GENERAL', error.message, error);
    
    toast.error(`Error${category ? ` en ${category}` : ''}`, {
      description: error.message,
      action: onRetry ? {
        label: 'Reintentar',
        onClick: onRetry
      } : undefined,
      duration: 5000
    });
  };

  const showWarning = (message: string, category?: string) => {
    logger.warn(category || 'GENERAL', message);
    
    toast.warning(`Advertencia${category ? ` en ${category}` : ''}`, {
      description: message,
      duration: 4000
    });
  };

  const showSuccess = (message: string, category?: string) => {
    logger.info(category || 'GENERAL', message);
    
    toast.success(`Éxito${category ? ` en ${category}` : ''}`, {
      description: message,
      duration: 3000
    });
  };

  const showInfo = (message: string, category?: string) => {
    logger.info(category || 'GENERAL', message);
    
    toast.info(`Info${category ? ` de ${category}` : ''}`, {
      description: message,
      duration: 3000
    });
  };

  return {
    showError,
    showWarning,
    showSuccess,
    showInfo
  };
}