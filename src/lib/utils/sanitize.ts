/**
 * Utility functions for sanitizing user input to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns The sanitized string safe for HTML display
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitizes user input for display in the UI
 * Removes dangerous characters and limits length
 * @param input - The user input to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns The sanitized input
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Escape HTML entities
  sanitized = sanitizeHtml(sanitized);

  return sanitized;
}

/**
 * Sanitizes a username for display
 * @param username - The username to sanitize
 * @returns The sanitized username
 */
export function sanitizeUsername(username: string): string {
  return sanitizeUserInput(username, 50);
}

/**
 * Sanitizes retrospective item content
 * @param content - The content to sanitize
 * @returns The sanitized content
 */
export function sanitizeItemContent(content: string): string {
  return sanitizeUserInput(content, 500);
}

/**
 * Creates a safe display name from user data
 * @param name - The user's name
 * @param email - The user's email (optional fallback)
 * @returns A safe display name
 */
export function createSafeDisplayName(name?: string, email?: string): string {
  if (name) {
    return sanitizeUsername(name);
  }

  if (email) {
    // Extract username from email and sanitize
    const username = email.split('@')[0];
    return sanitizeUsername(username);
  }

  return 'Anonymous';
}