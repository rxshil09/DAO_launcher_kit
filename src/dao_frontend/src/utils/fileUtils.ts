/**
 * File utility functions for handling image uploads
 */

/**
 * Converts a File object to Uint8Array for canister upload
 * @param file - The file to convert
 * @returns Promise that resolves to Uint8Array
 */
export const fileToBlob = async (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer));
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validates image file type and size
 * @param file - The file to validate
 * @returns Object with validation result and optional error message
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use JPG, PNG, GIF, or WebP.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB.',
    };
  }

  return { valid: true };
};

/**
 * Validates if a string is a valid image URL
 * @param url - The URL to validate
 * @returns true if valid image URL, false otherwise
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;

  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url);
    
    // Must be http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Check if URL ends with common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));

    // Also accept URLs with query parameters (like Pexels, Unsplash)
    const hasImageInPath = pathname.includes('/photo') || 
                           pathname.includes('/image') || 
                           pathname.includes('/img');

    return hasImageExtension || hasImageInPath;
  } catch {
    return false;
  }
};

/**
 * Creates a preview URL from a File object
 * @param file - The file to create preview from
 * @returns Promise that resolves to data URL string
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to create preview'));
    };
    
    reader.readAsDataURL(file);
  });
};
