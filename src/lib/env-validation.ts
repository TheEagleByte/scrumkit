/**
 * Environment variable validation
 * Ensures all required environment variables are present
 */

import { logger } from './logger';

// Define required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  },
} as const;

// Optional environment variables
const optionalEnvVars = {
  NODE_ENV: {
    description: 'Node environment',
    pattern: /^(development|production|test)$/,
    default: 'development',
  },
  NEXT_PUBLIC_APP_URL: {
    description: 'Application URL',
    pattern: /^https?:\/\/.+$/,
    default: 'http://localhost:3000',
  },
  NEXT_PUBLIC_APP_NAME: {
    description: 'Application name',
    pattern: /.+/,
    default: 'ScrumKit',
  },
} as const;

export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
}

class EnvValidator {
  private validated = false;
  private config: EnvConfig | null = null;

  /**
   * Validates all environment variables
   * Should be called at application startup
   */
  validate(): EnvConfig {
    if (this.validated && this.config) {
      return this.config;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Partial<EnvConfig> = {};

    // Check required variables
    for (const [key, { description, pattern }] of Object.entries(requiredEnvVars)) {
      const value = process.env[key];

      if (!value) {
        errors.push(`Missing required environment variable: ${key} (${description})`);
        continue;
      }

      if (!pattern.test(value)) {
        errors.push(`Invalid format for ${key}: ${description}`);
        continue;
      }

      (config as Record<string, string>)[key] = value;
    }

    // Check optional variables
    for (const [key, { description, pattern, default: defaultValue }] of Object.entries(optionalEnvVars)) {
      const value = process.env[key];

      if (!value) {
        warnings.push(`Using default value for ${key}: ${defaultValue}`);
        (config as Record<string, string>)[key] = defaultValue;
        continue;
      }

      if (!pattern.test(value)) {
        warnings.push(`Invalid format for ${key}: ${description}, using default: ${defaultValue}`);
        (config as Record<string, string>)[key] = defaultValue;
        continue;
      }

      (config as Record<string, string>)[key] = value;
    }

    // Log warnings
    warnings.forEach(warning => logger.warn(warning));

    // Throw if there are errors
    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.validated = true;
    this.config = config as EnvConfig;

    logger.info('Environment variables validated successfully', {
      supabaseUrl: this.config.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...',
      appUrl: this.config.NEXT_PUBLIC_APP_URL,
      nodeEnv: this.config.NODE_ENV,
    });

    return this.config;
  }

  /**
   * Gets the validated environment config
   * Throws if validation hasn't been performed
   */
  getConfig(): EnvConfig {
    if (!this.validated || !this.config) {
      throw new Error('Environment variables have not been validated. Call validate() first.');
    }
    return this.config;
  }

  /**
   * Checks if running in development mode
   */
  isDevelopment(): boolean {
    return this.getConfig().NODE_ENV === 'development';
  }

  /**
   * Checks if running in production mode
   */
  isProduction(): boolean {
    return this.getConfig().NODE_ENV === 'production';
  }

  /**
   * Checks if running in test mode
   */
  isTest(): boolean {
    return this.getConfig().NODE_ENV === 'test';
  }
}

export const envValidator = new EnvValidator();

// Validate on import in development
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    envValidator.validate();
  } catch (error) {
    // Log but don't crash in development
    logger.error('Environment validation failed during import', error as Error);
  }
}