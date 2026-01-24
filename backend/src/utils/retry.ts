/**
 * Retry utility for database operations with exponential backoff
 * Implements NFR20: Graceful degradation and retry logic
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Executes an async function with retry logic and exponential backoff
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise with the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | unknown;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable (database connection errors, timeouts)
      if (!isRetryableError(error)) {
        throw error; // Don't retry non-retryable errors
      }

      // Last attempt - don't delay, just throw
      if (attempt === opts.maxRetries - 1) {
        break;
      }

      console.warn(`⚠️ Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms. Error:`, error);

      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt, up to maxDelay
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Determines if an error is retryable (connection issues, timeouts)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const retryableMessages = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'connection terminated',
    'database connection',
    'timeout',
    'Connection terminated',
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toUpperCase() || '';

  return retryableMessages.some(
    msg => errorMessage.includes(msg.toLowerCase()) || errorCode.includes(msg)
  );
}
