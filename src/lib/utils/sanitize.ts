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

/**
 * Validates if the text is valid for a retrospective item
 * @param text - The text to validate
 * @returns Whether the text is valid
 */
export function isValidItemText(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required' };
  }

  const trimmed = text.trim();

  // Must have at least 3 characters
  if (trimmed.length < 3) {
    return { valid: false, error: 'Text must be at least 3 characters long' };
  }

  // Must not exceed max length
  if (trimmed.length > 500) {
    return { valid: false, error: 'Text must not exceed 500 characters' };
  }

  // Check for spam patterns
  const spamPatterns = [
    { pattern: /(.)\1{10,}/, error: 'Text contains repeated characters' },
    { pattern: /^[^a-zA-Z0-9\s]+$/, error: 'Text must contain alphanumeric characters' },
    { pattern: /^[\s]+$/, error: 'Text cannot be only whitespace' },
  ];

  for (const { pattern, error } of spamPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error };
    }
  }

  return { valid: true };
}