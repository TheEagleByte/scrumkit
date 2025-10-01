/**
 * Utility functions for client-side cookie operations
 */

/**
 * Get a cookie value by name
 * @param name - The cookie name to retrieve
 * @returns The cookie value or undefined if not found
 */
export function getCookie(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

/**
 * Set a cookie with name, value, and options
 * @param name - The cookie name
 * @param value - The cookie value
 * @param days - Number of days until expiration (default: 365)
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof window === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

/**
 * Delete a cookie by name
 * @param name - The cookie name to delete
 */
export function deleteCookie(name: string): void {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
