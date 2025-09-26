/**
 * Tests for environment validation utility
 * Validates environment variable validation, error handling, and configuration management
 */

import { envValidator, EnvConfig } from '@/lib/env-validation';

// Mock the logger to avoid actual logging during tests
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

import { logger } from '@/lib/logger';

describe('Environment Validation Utility', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };

    // Clear all mock calls
    jest.clearAllMocks();

    // Reset the validator instance by clearing its internal state
    // This requires creating a new instance or resetting the singleton
    (envValidator as any).validated = false;
    (envValidator as any).config = null;
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Required Environment Variables', () => {
    describe('NEXT_PUBLIC_SUPABASE_URL validation', () => {
      it('should validate correct Supabase URL format', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://abcdefgh.supabase.co');
        expect(logger.error).not.toHaveBeenCalled();
      });

      it('should reject URL without https', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://abcdefgh.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        expect(() => envValidator.validate()).toThrow('Environment validation failed');
        expect(logger.error).toHaveBeenCalled();
      });

      it('should reject invalid domain format', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-domain.com';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        expect(() => envValidator.validate()).toThrow('Environment validation failed');
      });

      it('should reject empty URL', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        expect(() => envValidator.validate()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
      });

      it('should reject missing URL', () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        expect(() => envValidator.validate()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
      });
    });

    describe('NEXT_PUBLIC_SUPABASE_ANON_KEY validation', () => {
      it('should validate correct JWT format', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
      });

      it('should reject invalid JWT format', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-jwt-token';

        expect(() => envValidator.validate()).toThrow('Invalid format for NEXT_PUBLIC_SUPABASE_ANON_KEY');
      });

      it('should reject JWT with missing parts', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';

        expect(() => envValidator.validate()).toThrow('Invalid format for NEXT_PUBLIC_SUPABASE_ANON_KEY');
      });

      it('should reject empty anon key', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

        expect(() => envValidator.validate()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
      });

      it('should reject missing anon key', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        expect(() => envValidator.validate()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
      });
    });
  });

  describe('Optional Environment Variables', () => {
    beforeEach(() => {
      // Set required vars for these tests
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    });

    describe('NODE_ENV validation', () => {
      it('should accept valid NODE_ENV values', () => {
        process.env.NODE_ENV = 'development';
        const config = envValidator.validate();
        expect(config.NODE_ENV).toBe('development');

        // Reset for next test
        (envValidator as any).validated = false;
        (envValidator as any).config = null;
        process.env.NODE_ENV = 'production';
        const config2 = envValidator.validate();
        expect(config2.NODE_ENV).toBe('production');

        // Reset for next test
        (envValidator as any).validated = false;
        (envValidator as any).config = null;
        process.env.NODE_ENV = 'test';
        const config3 = envValidator.validate();
        expect(config3.NODE_ENV).toBe('test');
      });

      it('should use default when NODE_ENV is missing', () => {
        delete process.env.NODE_ENV;

        const config = envValidator.validate();

        expect(config.NODE_ENV).toBe('development');
        expect(logger.warn).toHaveBeenCalledWith('Using default value for NODE_ENV: development');
      });

      it('should use default when NODE_ENV is invalid', () => {
        process.env.NODE_ENV = 'invalid';

        const config = envValidator.validate();

        expect(config.NODE_ENV).toBe('development');
        expect(logger.warn).toHaveBeenCalledWith('Invalid format for NODE_ENV: Node environment, using default: development');
      });
    });

    describe('NEXT_PUBLIC_APP_URL validation', () => {
      it('should accept valid URLs', () => {
        process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_URL).toBe('https://myapp.com');
      });

      it('should accept HTTP URLs', () => {
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
      });

      it('should use default when missing', () => {
        delete process.env.NEXT_PUBLIC_APP_URL;

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
        expect(logger.warn).toHaveBeenCalledWith('Using default value for NEXT_PUBLIC_APP_URL: http://localhost:3000');
      });

      it('should use default when invalid', () => {
        process.env.NEXT_PUBLIC_APP_URL = 'not-a-url';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
        expect(logger.warn).toHaveBeenCalledWith('Invalid format for NEXT_PUBLIC_APP_URL: Application URL, using default: http://localhost:3000');
      });
    });

    describe('NEXT_PUBLIC_APP_NAME validation', () => {
      it('should accept valid app names', () => {
        process.env.NEXT_PUBLIC_APP_NAME = 'My Custom App';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_NAME).toBe('My Custom App');
      });

      it('should use default when missing', () => {
        delete process.env.NEXT_PUBLIC_APP_NAME;

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_NAME).toBe('ScrumKit');
        expect(logger.warn).toHaveBeenCalledWith('Using default value for NEXT_PUBLIC_APP_NAME: ScrumKit');
      });

      it('should accept empty string', () => {
        process.env.NEXT_PUBLIC_APP_NAME = '';

        const config = envValidator.validate();

        expect(config.NEXT_PUBLIC_APP_NAME).toBe('ScrumKit');
        expect(logger.warn).toHaveBeenCalledWith('Using default value for NEXT_PUBLIC_APP_NAME: ScrumKit');
      });
    });
  });

  describe('Validation Caching', () => {
    beforeEach(() => {
      // Set valid environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    });

    it('should cache validation results', () => {
      const config1 = envValidator.validate();
      const config2 = envValidator.validate();

      expect(config1).toBe(config2); // Same reference
      expect(logger.info).toHaveBeenCalledTimes(1); // Only logged once
    });

    it('should return same config from getConfig after validation', () => {
      const config1 = envValidator.validate();
      const config2 = envValidator.getConfig();

      expect(config1).toBe(config2);
    });
  });

  describe('getConfig method', () => {
    it('should throw error when called before validation', () => {
      expect(() => envValidator.getConfig()).toThrow('Environment variables have not been validated. Call validate() first.');
    });

    it('should return config after validation', () => {
      // Set valid environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      envValidator.validate();
      const config = envValidator.getConfig();

      expect(config).toBeDefined();
      expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://abcdefgh.supabase.co');
    });
  });

  describe('Environment Helper Methods', () => {
    beforeEach(() => {
      // Set valid environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    });

    describe('isDevelopment', () => {
      it('should return true for development environment', () => {
        process.env.NODE_ENV = 'development';
        envValidator.validate();

        expect(envValidator.isDevelopment()).toBe(true);
      });

      it('should return false for non-development environment', () => {
        process.env.NODE_ENV = 'production';
        envValidator.validate();

        expect(envValidator.isDevelopment()).toBe(false);
      });

      it('should throw when called before validation', () => {
        expect(() => envValidator.isDevelopment()).toThrow('Environment variables have not been validated');
      });
    });

    describe('isProduction', () => {
      it('should return true for production environment', () => {
        process.env.NODE_ENV = 'production';
        envValidator.validate();

        expect(envValidator.isProduction()).toBe(true);
      });

      it('should return false for non-production environment', () => {
        process.env.NODE_ENV = 'development';
        envValidator.validate();

        expect(envValidator.isProduction()).toBe(false);
      });

      it('should throw when called before validation', () => {
        expect(() => envValidator.isProduction()).toThrow('Environment variables have not been validated');
      });
    });

    describe('isTest', () => {
      it('should return true for test environment', () => {
        process.env.NODE_ENV = 'test';
        envValidator.validate();

        expect(envValidator.isTest()).toBe(true);
      });

      it('should return false for non-test environment', () => {
        process.env.NODE_ENV = 'development';
        envValidator.validate();

        expect(envValidator.isTest()).toBe(false);
      });

      it('should throw when called before validation', () => {
        expect(() => envValidator.isTest()).toThrow('Environment variables have not been validated');
      });
    });
  });

  describe('Multiple Error Handling', () => {
    it('should accumulate multiple validation errors', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => envValidator.validate()).toThrow('Environment validation failed');

      const errorCall = (logger.error as jest.Mock).mock.calls[0][0];
      expect(errorCall).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(errorCall).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });

    it('should show all invalid format errors', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-token';

      expect(() => envValidator.validate()).toThrow('Environment validation failed');

      const errorCall = (logger.error as jest.Mock).mock.calls[0][0];
      expect(errorCall).toContain('Invalid format for NEXT_PUBLIC_SUPABASE_URL');
      expect(errorCall).toContain('Invalid format for NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });
  });

  describe('Logging Behavior', () => {
    beforeEach(() => {
      // Set valid environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    });

    it('should log success with masked sensitive data', () => {
      envValidator.validate();

      expect(logger.info).toHaveBeenCalledWith(
        'Environment variables validated successfully',
        expect.objectContaining({
          supabaseUrl: expect.stringContaining('https://abcdefgh.supabase.co...'),
          appUrl: 'http://localhost:3000',
          nodeEnv: expect.any(String), // Could be test, development, or production depending on environment
        })
      );

      // Check that the URL is properly masked
      const logCall = (logger.info as jest.Mock).mock.calls[0][1];
      expect(logCall.supabaseUrl).toHaveLength(31); // 28 chars + '...'
    });

    it('should not log sensitive anon key', () => {
      envValidator.validate();

      const logCall = (logger.info as jest.Mock).mock.calls[0][1];
      expect(JSON.stringify(logCall)).not.toContain(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      // Set valid environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    });

    it('should return correctly typed EnvConfig', () => {
      const config = envValidator.validate();

      // Type assertions to ensure TypeScript compatibility
      expect(typeof config.NEXT_PUBLIC_SUPABASE_URL).toBe('string');
      expect(typeof config.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('string');
      expect(typeof config.NODE_ENV).toBe('string');
      expect(['development', 'production', 'test']).toContain(config.NODE_ENV);
      expect(typeof config.NEXT_PUBLIC_APP_URL).toBe('string');
      expect(typeof config.NEXT_PUBLIC_APP_NAME).toBe('string');
    });

    it('should have all required properties', () => {
      const config = envValidator.validate();

      expect(config).toHaveProperty('NEXT_PUBLIC_SUPABASE_URL');
      expect(config).toHaveProperty('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      expect(config).toHaveProperty('NODE_ENV');
      expect(config).toHaveProperty('NEXT_PUBLIC_APP_URL');
      expect(config).toHaveProperty('NEXT_PUBLIC_APP_NAME');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined process.env gracefully', () => {
      // Temporarily remove process.env
      const originalProcessEnv = process.env;
      (global as any).process = { env: {} };

      expect(() => envValidator.validate()).toThrow('Environment validation failed');

      // Restore process.env
      (global as any).process.env = originalProcessEnv;
    });

    it('should handle whitespace-only values', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '   ';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      expect(() => envValidator.validate()).toThrow('Invalid format for NEXT_PUBLIC_SUPABASE_URL');
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://abcdefgh.supabase.co' + '?param=' + 'a'.repeat(1000);
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      process.env.NEXT_PUBLIC_APP_URL = longUrl;

      expect(() => envValidator.validate()).not.toThrow();
    });
  });
});