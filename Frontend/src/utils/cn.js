/**
 * Utility function to combine CSS classes
 * This replaces the missing lib/utils cn function
 */

/**
 * Combines multiple class names into a single string
 * @param {...(string|undefined|null|false)} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return classes
    .filter(Boolean) // Remove falsy values (undefined, null, false, empty strings)
    .join(' ') // Join with spaces
    .trim(); // Remove leading/trailing whitespace
}

export default cn;
