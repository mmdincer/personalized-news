/**
 * Environment Variable Validator
 * 
 * Validates all required environment variables at startup
 * Provides clear error messages for missing or invalid variables
 */

/**
 * Validate environment variables
 * Throws error if required variables are missing or invalid
 */
const validateEnv = () => {
  const errors = [];
  const warnings = [];

  // Required variables
  const required = {
    SUPABASE_URL: {
      value: process.env.SUPABASE_URL,
      message: 'SUPABASE_URL is required. Get it from your Supabase project settings.',
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      message: 'SUPABASE_SERVICE_ROLE_KEY is required. Get it from your Supabase project settings.',
    },
    JWT_SECRET: {
      value: process.env.JWT_SECRET,
      message: 'JWT_SECRET is required. Generate a strong secret key (min 32 characters).',
      validator: (val) => {
        if (!val || val.length < 32) {
          return 'JWT_SECRET must be at least 32 characters long';
        }
        return null;
      },
    },
    NEWSAPI_KEY: {
      value: process.env.NEWSAPI_KEY,
      message: 'NEWSAPI_KEY is required. Get it from https://newsapi.org/',
    },
  };

  // Optional but recommended variables
  const optional = {
    NODE_ENV: {
      value: process.env.NODE_ENV,
      defaultValue: 'development',
      validator: (val) => {
        const valid = ['development', 'production', 'test'];
        if (val && !valid.includes(val)) {
          return `NODE_ENV must be one of: ${valid.join(', ')}`;
        }
        return null;
      },
    },
    PORT: {
      value: process.env.PORT,
      defaultValue: '3000',
      validator: (val) => {
        if (val && (isNaN(val) || parseInt(val) < 1 || parseInt(val) > 65535)) {
          return 'PORT must be a number between 1 and 65535';
        }
        return null;
      },
    },
    CORS_ORIGIN: {
      value: process.env.CORS_ORIGIN,
      defaultValue: 'http://localhost:5173',
      validator: (val) => {
        if (val && !/^https?:\/\/.+/.test(val)) {
          return 'CORS_ORIGIN must be a valid URL (http:// or https://)';
        }
        return null;
      },
    },
  };

  // Validate required variables
  Object.entries(required).forEach(([key, config]) => {
    if (!config.value) {
      errors.push(`❌ ${key}: ${config.message}`);
    } else if (config.validator) {
      const validationError = config.validator(config.value);
      if (validationError) {
        errors.push(`❌ ${key}: ${validationError}`);
      }
    }
  });

  // Validate optional variables
  Object.entries(optional).forEach(([key, config]) => {
    const value = config.value || config.defaultValue;
    
    if (config.validator) {
      const validationError = config.validator(value);
      if (validationError) {
        warnings.push(`⚠️  ${key}: ${validationError}`);
      }
    }

    // Warn if using default in production
    if (!config.value && process.env.NODE_ENV === 'production' && config.defaultValue) {
      warnings.push(`⚠️  ${key}: Using default value "${config.defaultValue}" in production`);
    }
  });

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CORS_ORIGINS && !process.env.CORS_ORIGIN) {
      warnings.push('⚠️  CORS_ORIGIN or CORS_ORIGINS should be set in production');
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
      warnings.push('⚠️  JWT_SECRET should be at least 64 characters in production');
    }

    if (!process.env.ADMIN_EMAILS) {
      warnings.push('⚠️  ADMIN_EMAILS should be set in production for admin access control');
    }
  }

  // Display errors and warnings
  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Validation Failed:\n');
    errors.forEach((error) => console.error(`  ${error}`));
    console.error('\n💡 Tip: Copy .env.example to .env and fill in your values\n');
    throw new Error('Missing or invalid required environment variables');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:\n');
    warnings.forEach((warning) => console.warn(`  ${warning}`));
    console.warn('');
  }

  // Success message
  if (process.env.NODE_ENV !== 'test') {
    console.log('✓ Environment variables validated successfully\n');
  }
};

module.exports = { validateEnv };

