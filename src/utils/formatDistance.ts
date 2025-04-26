/**
 * Formats a distance in meters to a user-friendly string
 * using meters for distances under 1000m and kilometers for larger distances
 * 
 * @param meters - Distance in meters
 * @param decimals - Number of decimal places for km representation (default 1)
 * @returns Formatted distance string with appropriate unit
 */
export default function formatDistance(meters: number, decimals: number = 1): string {
  if (meters < 1000) {
    // Round to nearest meter for small distances
    return `${Math.round(meters)}m`;
  } else {
    // Convert to kilometers with specified decimal places
    const km = meters / 1000;
    return `${km.toFixed(decimals)}km`;
  }
} 