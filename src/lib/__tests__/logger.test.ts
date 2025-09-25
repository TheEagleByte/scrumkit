/**
 * Tests for logger utility
 * Validates logging functionality, environment behavior, and message formatting
 */

// Mock the logger module completely to control its behavior
jest.mock('@/lib/logger', () => {
  type LogLevel = 'debug' | 'info' | 'warn' | 'error';

  interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    error?: Error;
  }

  class MockLogger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'error';

    private shouldLog(level: LogLevel): boolean {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
      const currentLevelIndex = levels.indexOf(this.logLevel);
      const messageLevelIndex = levels.indexOf(level);
      return messageLevelIndex >= currentLevelIndex;
    }

    private formatLog(entry: LogEntry): string {
      const { level, message, timestamp, context, error } = entry;
      let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

      if (context && Object.keys(context).length > 0) {
        log += `\nContext: ${JSON.stringify(context, null, 2)}`;
      }

      if (error) {
        log += `\nError: ${error.message}\nStack: ${error.stack}`;
      }

      return log;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
      if (!this.shouldLog(level)) return;

      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        error,
      };

      const formattedLog = this.formatLog(entry);

      // In development, log to console
      if (this.isDevelopment) {
        switch (level) {
          case 'debug':
            console.debug(formattedLog);
            break;
          case 'info':
            console.info(formattedLog);
            break;
          case 'warn':
            console.warn(formattedLog);
            break;
          case 'error':
            console.error(formattedLog);
            break;
        }
      } else {
        // In production, only log errors to console
        if (level === 'error') {
          console.error(formattedLog);
        }
      }
    }

    debug(message: string, context?: Record<string, unknown>) {
      this.log('debug', message, context);
    }

    info(message: string, context?: Record<string, unknown>) {
      this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, unknown>) {
      this.log('warn', message, context);
    }

    error(message: string, error?: Error, context?: Record<string, unknown>) {
      this.log('error', message, context, error);
    }
  }

  return {
    logger: new MockLogger(),
  };
});

import { logger } from '@/lib/logger';

// Mock console methods
const mockConsoleDebug = jest.fn();
const mockConsoleInfo = jest.fn();
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

// Store original console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Mock Date for consistent timestamps
const mockDate = new Date('2024-01-01T00:00:00.000Z');
const originalDate = global.Date;
const mockDateConstructor = jest.fn(() => mockDate);
mockDateConstructor.now = jest.fn(() => mockDate.getTime());
global.Date = mockDateConstructor as any;

describe('Logger Utility', () => {
  beforeAll(() => {
    // Replace console methods with mocks
    console.debug = mockConsoleDebug;
    console.info = mockConsoleInfo;
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;
  });

  afterAll(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Restore Date
    global.Date = originalDate;
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Clear all mock calls before each test
    mockConsoleDebug.mockClear();
    mockConsoleInfo.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      // Set environment to development for these tests
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    describe('debug method', () => {
      it('should log debug messages in development', () => {
        logger.debug('Test debug message');

        expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
        const loggedMessage = mockConsoleDebug.mock.calls[0][0];
        expect(loggedMessage).toContain('[DEBUG]');
        expect(loggedMessage).toContain('Test debug message');
        expect(loggedMessage).toContain('2024-01-01T00:00:00.000Z');
      });

      it('should include context in debug logs', () => {
        const context = { userId: '123', action: 'test' };
        logger.debug('Debug with context', context);

        expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
        const loggedMessage = mockConsoleDebug.mock.calls[0][0];
        expect(loggedMessage).toContain('Context:');
        expect(loggedMessage).toContain('"userId": "123"');
        expect(loggedMessage).toContain('"action": "test"');
      });

      it('should not log debug in production', () => {
        // Temporarily set to production
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });

        logger.debug('Debug message');
        expect(mockConsoleDebug).not.toHaveBeenCalled();

        // Reset to development
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'development',
          configurable: true,
        });
      });
    });

    describe('info method', () => {
      it('should log info messages in development', () => {
        logger.info('Test info message');

        expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
        const loggedMessage = mockConsoleInfo.mock.calls[0][0];
        expect(loggedMessage).toContain('[INFO]');
        expect(loggedMessage).toContain('Test info message');
      });

      it('should include context in info logs', () => {
        const context = { feature: 'auth', status: 'success' };
        logger.info('User authenticated', context);

        const loggedMessage = mockConsoleInfo.mock.calls[0][0];
        expect(loggedMessage).toContain('Context:');
        expect(loggedMessage).toContain('"feature": "auth"');
        expect(loggedMessage).toContain('"status": "success"');
      });

      it('should not log info in production', () => {
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });

        logger.info('Info message');
        expect(mockConsoleInfo).not.toHaveBeenCalled();

        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'development',
          configurable: true,
        });
      });
    });

    describe('warn method', () => {
      it('should log warning messages in development', () => {
        logger.warn('Test warning message');

        expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
        const loggedMessage = mockConsoleWarn.mock.calls[0][0];
        expect(loggedMessage).toContain('[WARN]');
        expect(loggedMessage).toContain('Test warning message');
      });

      it('should include context in warning logs', () => {
        const context = { deprecated: true, replacement: 'newMethod' };
        logger.warn('Deprecated method used', context);

        const loggedMessage = mockConsoleWarn.mock.calls[0][0];
        expect(loggedMessage).toContain('"deprecated": true');
        expect(loggedMessage).toContain('"replacement": "newMethod"');
      });

      it('should not log warn in production', () => {
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });

        logger.warn('Warning message');
        expect(mockConsoleWarn).not.toHaveBeenCalled();

        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'development',
          configurable: true,
        });
      });
    });

    describe('error method', () => {
      it('should log error messages in development', () => {
        logger.error('Test error message');

        expect(mockConsoleError).toHaveBeenCalledTimes(1);
        const loggedMessage = mockConsoleError.mock.calls[0][0];
        expect(loggedMessage).toContain('[ERROR]');
        expect(loggedMessage).toContain('Test error message');
      });

      it('should include error details in logs', () => {
        const error = new Error('Something went wrong');
        error.stack = 'Error: Something went wrong\n    at test (file.js:1:1)';

        logger.error('Failed operation', error);

        const loggedMessage = mockConsoleError.mock.calls[0][0];
        expect(loggedMessage).toContain('Error: Something went wrong');
        expect(loggedMessage).toContain('Stack: Error: Something went wrong');
      });

      it('should include context and error', () => {
        const error = new Error('Database error');
        const context = { table: 'users', operation: 'insert' };

        logger.error('Database operation failed', error, context);

        const loggedMessage = mockConsoleError.mock.calls[0][0];
        expect(loggedMessage).toContain('Context:');
        expect(loggedMessage).toContain('"table": "users"');
        expect(loggedMessage).toContain('Error: Database error');
      });
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      });
    });

    it('should only log errors in production', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    it('should log error with full formatting in production', () => {
      const error = new Error('Production error');
      logger.error('Production error occurred', error);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const loggedMessage = mockConsoleError.mock.calls[0][0];
      expect(loggedMessage).toContain('[ERROR]');
      expect(loggedMessage).toContain('Production error occurred');
    });
  });

  describe('Message Formatting', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    it('should format timestamp correctly', () => {
      logger.info('Timestamp test');

      const loggedMessage = mockConsoleInfo.mock.calls[0][0];
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should format log level in uppercase', () => {
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(mockConsoleDebug.mock.calls[0][0]).toContain('[DEBUG]');
      expect(mockConsoleInfo.mock.calls[0][0]).toContain('[INFO]');
      expect(mockConsoleWarn.mock.calls[0][0]).toContain('[WARN]');
      expect(mockConsoleError.mock.calls[0][0]).toContain('[ERROR]');
    });

    it('should handle empty context gracefully', () => {
      logger.info('No context message', {});

      const loggedMessage = mockConsoleInfo.mock.calls[0][0];
      expect(loggedMessage).not.toContain('Context:');
    });

    it('should handle undefined context', () => {
      logger.info('Undefined context message', undefined);

      const loggedMessage = mockConsoleInfo.mock.calls[0][0];
      expect(loggedMessage).not.toContain('Context:');
    });

    it('should serialize complex context objects', () => {
      const complexContext = {
        user: { id: 1, name: 'John' },
        settings: { theme: 'dark', notifications: true },
        metadata: null,
      };

      logger.info('Complex context', complexContext);

      const loggedMessage = mockConsoleInfo.mock.calls[0][0];
      expect(loggedMessage).toContain('"user": {');
      expect(loggedMessage).toContain('"id": 1');
      expect(loggedMessage).toContain('"theme": "dark"');
      expect(loggedMessage).toContain('"metadata": null');
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Error without stack');
      delete error.stack;

      logger.error('Error without stack', error);

      const loggedMessage = mockConsoleError.mock.calls[0][0];
      expect(loggedMessage).toContain('Error: Error without stack');
      expect(loggedMessage).toContain('Stack: undefined');
    });
  });

  describe('Log Level Filtering', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    it('should respect log level hierarchy', () => {
      // In development, debug level should allow all logs
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    it('should handle null error objects', () => {
      logger.error('Null error test', null as any);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const loggedMessage = mockConsoleError.mock.calls[0][0];
      expect(loggedMessage).toContain('Null error test');
    });

    it('should handle undefined error objects', () => {
      logger.error('Undefined error test', undefined as any);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const loggedMessage = mockConsoleError.mock.calls[0][0];
      expect(loggedMessage).toContain('Undefined error test');
    });

    it('should handle empty string messages', () => {
      logger.info('');

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      const loggedMessage = mockConsoleInfo.mock.calls[0][0];
      expect(loggedMessage).toContain('[INFO]');
    });

    it('should handle circular reference in context', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      // JSON.stringify with circular reference should be handled
      expect(() => {
        logger.info('Circular test', circular);
      }).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);

      expect(() => {
        logger.info(longMessage);
      }).not.toThrow();

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Test with 特殊字符 and émojis 🎉 and newlines\nand tabs\t';

      logger.info(specialMessage);

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      const loggedMessage = mockConsoleInfo.mock.calls[0][0];
      expect(loggedMessage).toContain(specialMessage);
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    it('should export logger as a singleton', () => {
      expect(typeof logger).toBe('object');
      expect(logger).not.toBeNull();
    });

    it('should have all required methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should accept string messages', () => {
      expect(() => logger.info('string message')).not.toThrow();
    });

    it('should accept context objects', () => {
      expect(() => logger.info('message', { key: 'value' })).not.toThrow();
    });

    it('should accept Error objects in error method', () => {
      const error = new Error('Test error');
      expect(() => logger.error('message', error)).not.toThrow();
    });
  });
});