/**
 * Frontend Environment Variable Validator
 * 
 * Validates environment variables at build time
 * Provides warnings for missing or invalid variables
 */

/**
 * Validate environment variables
 * Logs warnings for missing or invalid variables
 */
export const validateEnv = () => {
  const warnings = [];

  // Required variables
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    warnings.push('⚠️  VITE_API_BASE_URL is not set. Using default: http://localhost:3000/api');
  } else if (!/^https?:\/\/.+/.test(apiBaseUrl)) {
    warnings.push('⚠️  VITE_API_BASE_URL must be a valid URL (http:// or https://)');
  }

  // Production checks
  if (import.meta.env.MODE === 'production') {
    if (!apiBaseUrl || apiBaseUrl.includes('localhost')) {
      warnings.push('⚠️  VITE_API_BASE_URL should point to production API in production mode');
    }

    if (!apiBaseUrl || !apiBaseUrl.startsWith('https://')) {
      warnings.push('⚠️  VITE_API_BASE_URL should use HTTPS in production');
    }
  }

  // Display warnings
  if (warnings.length > 0 && import.meta.env.MODE !== 'test') {
    console.warn('\n⚠️  Environment Variable Warnings:\n');
    warnings.forEach((warning) => console.warn(`  ${warning}`));
    console.warn('');
  }

  return {
    apiBaseUrl: apiBaseUrl || 'http://localhost:3000/api',
    isValid: warnings.length === 0,
  };
};

// Auto-validate on module load (only in browser)
if (typeof window !== 'undefined') {
  validateEnv();
}


