export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
  userAgent?: string;
  url?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isProduction = process.env.NODE_ENV === 'production';

  private createEntry(level: LogLevel, category: string, message: string, data?: any, error?: Error): LogEntry {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry);
    
    // Keep only latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage
    try {
      localStorage.setItem('lukspeed_logs', JSON.stringify(this.logs.slice(0, 100)));
    } catch (e) {
      console.warn('Failed to store logs in localStorage:', e);
    }

    // Console output based on level
    const levelName = LogLevel[entry.level];
    const prefix = `[${entry.timestamp}] [${levelName}] [${entry.category}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        if (!this.isProduction) console.debug(prefix, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, entry.message, entry.data, entry.stack);
        break;
    }
  }

  debug(category: string, message: string, data?: any) {
    this.addLog(this.createEntry(LogLevel.DEBUG, category, message, data));
  }

  info(category: string, message: string, data?: any) {
    this.addLog(this.createEntry(LogLevel.INFO, category, message, data));
  }

  warn(category: string, message: string, data?: any) {
    this.addLog(this.createEntry(LogLevel.WARN, category, message, data));
  }

  error(category: string, message: string, error?: Error, data?: any) {
    this.addLog(this.createEntry(LogLevel.ERROR, category, message, data, error));
  }

  fatal(category: string, message: string, error?: Error, data?: any) {
    this.addLog(this.createEntry(LogLevel.FATAL, category, message, data, error));
  }

  // Strava-specific logging methods
  stravaDebug(message: string, data?: any) {
    this.debug('STRAVA', message, data);
  }

  stravaInfo(message: string, data?: any) {
    this.info('STRAVA', message, data);
  }

  stravaError(message: string, error?: Error, data?: any) {
    this.error('STRAVA', message, error, data);
  }

  // Auth-specific logging methods
  authDebug(message: string, data?: any) {
    this.debug('AUTH', message, data);
  }

  authInfo(message: string, data?: any) {
    this.info('AUTH', message, data);
  }

  authError(message: string, error?: Error, data?: any) {
    this.error('AUTH', message, error, data);
  }

  // API-specific logging methods
  apiDebug(message: string, data?: any) {
    this.debug('API', message, data);
  }

  apiInfo(message: string, data?: any) {
    this.info('API', message, data);
  }

  apiError(message: string, error?: Error, data?: any) {
    this.error('API', message, error, data);
  }

  // Get logs
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('lukspeed_logs');
    this.info('SYSTEM', 'Logs cleared');
  }

  // Load persisted logs
  loadPersistedLogs() {
    try {
      const stored = localStorage.getItem('lukspeed_logs');
      if (stored) {
        const parsedLogs = JSON.parse(stored) as LogEntry[];
        this.logs = parsedLogs;
        this.info('SYSTEM', `Loaded ${parsedLogs.length} persisted logs`);
      }
    } catch (e) {
      console.warn('Failed to load persisted logs:', e);
    }
  }

  // Get system info for debugging
  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
  }
}

// Global logger instance
export const logger = new LoggerService();

// Initialize with persisted logs
logger.loadPersistedLogs();

// Log system startup
logger.info('SYSTEM', 'Logger initialized', logger.getSystemInfo());