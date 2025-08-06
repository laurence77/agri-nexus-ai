/**
 * Secure logging utility for production applications
 * 
 * Features:
 * - Environment-based log levels
 * - Secure sensitive data filtering
 * - Production-ready error tracking
 * - Performance monitoring
 * - Audit trail capabilities
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogContext = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  source?: string;
  userId?: string;
  sessionId?: string;
}

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'info';
  
  // Sensitive data patterns to filter from logs
  private sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /apikey/i,
    /api_key/i,
    /authorization/i,
    /credential/i,
    /private_key/i,
    /cert/i,
    /ssn/i,
    /credit_card/i,
    /social_security/i
  ];

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    return levels[level] <= levels[this.logLevel];
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.sensitivePatterns.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    source?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitizeData(context) : undefined,
      source,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('auth_user');
      if (authData) {
        const user = JSON.parse(authData);
        return user.id;
      }
    } catch {
      // Ignore errors getting user ID
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('session_id') || undefined;
    } catch {
      return undefined;
    }
  }

  private outputLog(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: use console with colors and formatting
      const color = {
        error: 'color: red; font-weight: bold',
        warn: 'color: orange; font-weight: bold',
        info: 'color: blue',
        debug: 'color: gray'
      }[entry.level];

      console.group(`%c[${entry.level.toUpperCase()}] ${entry.message}`, color);
      if (entry.context) {
        console.log('Context:', entry.context);
      }
      if (entry.source) {
        console.log('Source:', entry.source);
      }
      console.log('Timestamp:', entry.timestamp);
      console.groupEnd();
    } else {
      // Production: structured JSON logging for external systems
      if (entry.level === 'error' || entry.level === 'warn') {
        console.error(JSON.stringify(entry));
      } else {
        console.log(JSON.stringify(entry));
      }
    }
  }

  error(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('error')) {
      const entry = this.createLogEntry('error', message, context, source);
      this.outputLog(entry);
      
      // Send to error tracking service in production
      if (!this.isDevelopment && window.gtag) {
        window.gtag('event', 'exception', {
          description: message,
          fatal: false,
          custom_map: { context: JSON.stringify(context || {}) }
        });
      }
    }
  }

  warn(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, context, source);
      this.outputLog(entry);
    }
  }

  info(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, context, source);
      this.outputLog(entry);
    }
  }

  debug(message: string, context?: LogContext, source?: string): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, context, source);
      this.outputLog(entry);
    }
  }

  // Audit logging for security events
  audit(action: string, context: LogContext, source?: string): void {
    const auditEntry = this.createLogEntry('info', `AUDIT: ${action}`, {
      ...context,
      audit: true,
      action
    }, source);
    
    this.outputLog(auditEntry);
    
    // Send audit logs to secure logging service
    if (!this.isDevelopment) {
      // In production, you would send this to a secure audit log service
      // Example: fetch('/api/audit-log', { method: 'POST', body: JSON.stringify(auditEntry) });
    }
  }

  // Performance monitoring
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Convenience exports
export const { error, warn, info, debug, audit } = logger;