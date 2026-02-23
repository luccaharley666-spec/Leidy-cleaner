/**
 * Utilities for converting snake_case database fields to camelCase for API response
 */

/**
 * Recursively convert object keys from snake_case to camelCase
 * Useful for converting database column names to API response format
 * 
 * @example
 * camelize({ first_name: 'John', last_updated: '2024-01-01' })
 * // { firstName: 'John', lastUpdated: '2024-01-01' }
 */
export function camelize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => camelize(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = toCamelCase(key);
      result[newKey] = camelize(obj[key]);
    }
  }
  return result;
}

/**
 * Convert a single string from snake_case to camelCase
 * @example
 * toCamelCase('user_id') // 'userId'
 * toCamelCase('first_name') // 'firstName'
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from camelCase to snake_case
 * Useful for converting API request data to database column names
 * 
 * @example
 * snakeify({ firstName: 'John', lastUpdated: '2024-01-01' })
 * // { first_name: 'John', last_updated: '2024-01-01' }
 */
export function snakeify(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => snakeify(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = toSnakeCase(key);
      result[newKey] = snakeify(obj[key]);
    }
  }
  return result;
}

/**
 * Convert a single string from camelCase to snake_case
 * @example
 * toSnakeCase('userId') // 'user_id'
 * toSnakeCase('firstName') // 'first_name'
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
