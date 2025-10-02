/**
 * Utility functions for authentication
 */

/**
 * Check if an error is a duplicate email error from Supabase
 * @param error - The error object to check
 * @returns True if the error indicates a duplicate email
 */
export function isDuplicateEmailError(error: unknown): boolean {
  if (!error) return false;

  // Extract error message safely
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Check for specific duplicate email error patterns from Supabase and PostgreSQL
  // Using more specific phrases to avoid false positives
  const duplicatePatterns = [
    'already registered',
    'email already',
    'email already exists',
    'account already exists',
    'user already exists',
    'email exists',
    'duplicate key value violates unique constraint',
    'duplicate email',
    'email address is already in use',
    'user with email already exists',
  ];

  return duplicatePatterns.some((pattern) => lowerMessage.includes(pattern));
}
