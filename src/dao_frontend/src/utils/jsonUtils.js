/**
 * Utility functions for handling BigInt serialization in JSON
 */

/**
 * Custom JSON serializer that converts BigInt values to strings
 * @param {any} obj - Object to serialize
 * @param {number} space - Number of spaces for indentation (optional)
 * @returns {string} - JSON string with BigInt values converted to strings
 */
export const safeJsonStringify = (obj, space = 0) => {
  return JSON.stringify(obj, (key, value) => {
    // Convert BigInt to string for JSON serialization
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, space);
};

/**
 * Parse JSON string and convert string numbers back to BigInt where appropriate
 * Note: This is a simple implementation that doesn't automatically detect BigInt fields
 * You would need to specify which fields should be BigInt if needed
 * @param {string} jsonString - JSON string to parse
 * @returns {any} - Parsed object
 */
export const safeJsonParse = (jsonString) => {
  return JSON.parse(jsonString);
};

export default { safeJsonStringify, safeJsonParse };
