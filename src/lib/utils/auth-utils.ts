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

  // Check for common duplicate email error patterns
  const duplicateKeywords = ['already', 'registered', 'exists'];

  return duplicateKeywords.some((keyword) => lowerMessage.includes(keyword));
}
