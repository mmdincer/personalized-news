/**
 * Network Utilities
 * 
 * Handles network-related functionality:
 * - Offline detection
 * - Retry logic for failed requests
 * - Network status monitoring
 */

/**
 * Check if browser is online
 * @returns {boolean} True if online, false if offline
 */
export const isOnline = () => {
  return navigator.onLine !== false;
};

/**
 * Wait for network to come online
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns {Promise<boolean>} True if online, false if timeout
 */
export const waitForOnline = (timeout = 30000) => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkOnline = () => {
      if (isOnline()) {
        resolve(true);
        window.removeEventListener('online', checkOnline);
      } else if (Date.now() - startTime > timeout) {
        resolve(false);
        window.removeEventListener('online', checkOnline);
      }
    };

    window.addEventListener('online', checkOnline);
    
    // Check periodically
    const interval = setInterval(() => {
      if (isOnline()) {
        clearInterval(interval);
        window.removeEventListener('online', checkOnline);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        window.removeEventListener('online', checkOnline);
        resolve(false);
      }
    }, 1000);
  });
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry (should return a Promise)
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried (default: retry on network errors)
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (
  fn,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      // Retry on network errors or 5xx server errors
      if (!isOnline()) return true;
      if (error?.response?.status >= 500) return true;
      if (error?.code === 'SYS_NETWORK_ERROR' || error?.code === 'SYS_TIMEOUT_ERROR') return true;
      return false;
    },
  } = {}
) => {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted retries or error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait for network if offline
      if (!isOnline()) {
        await waitForOnline(30000);
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
};

/**
 * Network status listener
 * Calls callback when network status changes
 * @param {Function} callback - Callback function (receives online status as boolean)
 * @returns {Function} Cleanup function to remove listener
 */
export const onNetworkStatusChange = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};




