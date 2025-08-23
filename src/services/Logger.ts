interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: 'auth' | 'sync' | 'metrics' | 'ui' | 'api' | 'performance';
  message: string;
  context?: {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    error?: Error;
    performance?: {
      startTime: number;
      duration: number;
    };
    data?: any;
  };
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadPersistedLogs();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadPersistedLogs(): void {
    try {
      const persistedLogs = localStorage.getItem('lukspeed_logs');
      if (persistedLogs) {
        this.logs = JSON.parse(persistedLogs);
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  private persistLogs(): void {
    try {
      localStorage.setItem('lukspeed_logs', JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (error) {
      console.warn('Failed to persist logs:', error);
    }
  }

  private log(level: LogEntry['level'], category: LogEntry['category'], message: string, context?: LogEntry['context']): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context: {
        ...context,
        sessionId: this.sessionId,
      }
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.persistLogs();
    this.consoleLog(entry);
  }

  private consoleLog(entry: LogEntry): void {
    const colorMap = {
      debug: '#8B5CF6',
      info: '#3B82F6', 
      warn: '#F59E0B',
      error: '#EF4444',
      critical: '#DC2626'
    };

    const color = colorMap[entry.level];
    const prefix = `[${entry.category.toUpperCase()}]`;
    
    if (entry.level === 'error' || entry.level === 'critical') {
      console.error(
        `%c${prefix} ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        entry.context
      );
      
      if (entry.context?.error) {
        console.error('Stack Trace:', entry.context.error);
      }
    } else if (entry.level === 'warn') {
      console.warn(
        `%c${prefix} ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        entry.context
      );
    } else {
      console.log(
        `%c${prefix} ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        entry.context
      );
    }
  }

  // Public logging methods
  public debug(category: LogEntry['category'], message: string, context?: LogEntry['context']): void {
    this.log('debug', category, message, context);
  }

  public info(category: LogEntry['category'], message: string, context?: LogEntry['context']): void {
    this.log('info', category, message, context);
  }

  public warn(category: LogEntry['category'], message: string, context?: LogEntry['context']): void {
    this.log('warn', category, message, context);
  }

  public error(category: LogEntry['category'], message: string, error?: Error, context?: LogEntry['context']): void {
    this.log('error', category, message, {
      ...context,
      error
    });
  }

  public critical(category: LogEntry['category'], message: string, error?: Error, context?: LogEntry['context']): void {
    this.log('critical', category, message, {
      ...context,
      error
    });
  }

  // Performance tracking
  public startTimer(action: string): string {
    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    this.debug('performance', `Started timer for: ${action}`, {
      action,
      performance: { startTime, duration: 0 }
    });

    return timerId;
  }

  public endTimer(timerId: string, category: LogEntry['category'], action: string, context?: LogEntry['context']): void {
    const endTime = performance.now();
    const duration = endTime - (context?.performance?.startTime || endTime);

    this.info('performance', `Completed ${action} in ${duration.toFixed(2)}ms`, {
      ...context,
      action,
      performance: { startTime: endTime - duration, duration }
    });
  }

  // Utility methods
  public getLogs(category?: LogEntry['category'], level?: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => {
      const categoryMatch = !category || log.category === category;
      const levelMatch = !level || log.level === level;
      return categoryMatch && levelMatch;
    });
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('lukspeed_logs');
    this.info('ui', 'Logs cleared');
  }

  // Strava-specific logging methods (backward compatibility)
  public stravaInfo(message: string, context?: any): void {
    this.info('sync', message, { component: 'Strava', data: context });
  }

  public stravaError(message: string, error?: Error, context?: any): void {
    this.error('sync', message, error, { component: 'Strava', data: context });
  }

  public stravaDebug(message: string, context?: any): void {
    this.debug('sync', message, { component: 'Strava', data: context });
  }

  // Auth-specific logging methods
  public authInfo(message: string, context?: any): void {
    this.info('auth', message, { component: 'Auth', data: context });
  }

  public authError(message: string, error?: Error, context?: any): void {
    this.error('auth', message, error, { component: 'Auth', data: context });
  }

  public authDebug(message: string, context?: any): void {
    this.debug('auth', message, { component: 'Auth', data: context });
  }

  // Metrics-specific logging methods
  public metricsInfo(message: string, context?: any): void {
    this.info('metrics', message, { component: 'Metrics', data: context });
  }

  public metricsError(message: string, error?: Error, context?: any): void {
    this.error('metrics', message, error, { component: 'Metrics', data: context });
  }

  public metricsDebug(message: string, context?: any): void {
    this.debug('metrics', message, { component: 'Metrics', data: context });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export for React Error Boundary
export const logError = (error: Error, errorInfo: any, component?: string) => {
  logger.critical('ui', `React Error in ${component || 'Unknown Component'}`, error, {
    component,
    data: errorInfo
  });
};

// Performance decorator for functions
export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  fn: T,
  category: LogEntry['category'],
  actionName: string
): T => {
  return ((...args: any[]) => {
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            const duration = performance.now() - startTime;
            logger.info('performance', `${actionName} completed in ${duration.toFixed(2)}ms`, {
              action: actionName,
              performance: { startTime, duration }
            });
            return value;
          })
          .catch((error) => {
            const duration = performance.now() - startTime;
            logger.error('performance', `${actionName} failed after ${duration.toFixed(2)}ms`, error, {
              action: actionName,
              performance: { startTime, duration }
            });
            throw error;
          });
      } else {
        const duration = performance.now() - startTime;
        logger.info('performance', `${actionName} completed in ${duration.toFixed(2)}ms`, {
          action: actionName,
          performance: { startTime, duration }
        });
        return result;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error('performance', `${actionName} failed after ${duration.toFixed(2)}ms`, error as Error, {
        action: actionName,
        performance: { startTime, duration }
      });
      throw error;
    }
  }) as T;
};