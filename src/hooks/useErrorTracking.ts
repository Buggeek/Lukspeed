import { useEffect } from 'react';
import { logger } from '@/services/Logger';
import { networkInterceptor } from '@/services/NetworkInterceptor';

export function useErrorTracking() {
  useEffect(() => {
    // Initialize network interceptor
    networkInterceptor.init();

    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      logger.fatal('GLOBAL_ERROR', event.message, event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href
      });
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.fatal('UNHANDLED_REJECTION', 'Unhandled promise rejection', event.reason, {
        reason: event.reason,
        url: window.location.href
      });
    };

    // Resource load error handler
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      logger.error('RESOURCE_ERROR', `Failed to load resource: ${target.tagName}`, undefined, {
        tagName: target.tagName,
        src: (target as any).src || (target as any).href,
        url: window.location.href
      });
    };

    // Network status handlers
    const handleOnline = () => {
      logger.info('NETWORK', 'Network connection restored');
    };

    const handleOffline = () => {
      logger.warn('NETWORK', 'Network connection lost');
    };

    // Page visibility handler
    const handleVisibilityChange = () => {
      logger.debug('PAGE', `Page visibility: ${document.hidden ? 'hidden' : 'visible'}`);
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleResourceError, true); // Capture phase for resource errors
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Log initial setup
    logger.info('ERROR_TRACKING', 'Error tracking initialized', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled
    });

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Return logging methods for manual use
  return {
    logError: (category: string, message: string, error?: Error, data?: any) => {
      logger.error(category, message, error, data);
    },
    logWarning: (category: string, message: string, data?: any) => {
      logger.warn(category, message, data);
    },
    logInfo: (category: string, message: string, data?: any) => {
      logger.info(category, message, data);
    },
    logDebug: (category: string, message: string, data?: any) => {
      logger.debug(category, message, data);
    }
  };
}