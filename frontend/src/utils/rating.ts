/**
 * Rating utility functions
 */

/**
 * Format a rating value for display
 * Handles both object format { average: X, count: Y } and number format
 *
 * @param rating - The rating value (can be object or number)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted rating string
 */
export function formatRating(rating: any, decimals: number = 1): string {
  if (!rating) return '0.0';

  if (typeof rating === 'object') {
    const avg = rating?.average || 0;
    return avg.toFixed(decimals);
  }

  if (typeof rating === 'number') {
    return rating.toFixed(decimals);
  }

  return '0.0';
}

/**
 * Get the numeric rating value
 *
 * @param rating - The rating value (can be object or number)
 * @returns Numeric rating value
 */
export function getRatingValue(rating: any): number {
  if (!rating) return 0;

  if (typeof rating === 'object') {
    return rating?.average || 0;
  }

  if (typeof rating === 'number') {
    return rating;
  }

  return 0;
}

/**
 * Get the rating count
 *
 * @param rating - The rating value (must be object with count)
 * @returns Number of ratings
 */
export function getRatingCount(rating: any): number {
  if (!rating) return 0;

  if (typeof rating === 'object') {
    return rating?.count || 0;
  }

  return 0;
}

/**
 * Check if a technician has ratings
 *
 * @param rating - The rating value
 * @returns True if the technician has at least one rating
 */
export function hasRatings(rating: any): boolean {
  return getRatingCount(rating) > 0;
}

/**
 * Get a formatted rating display with count
 * Example: "4.5 (12 reviews)" or "No ratings yet"
 *
 * @param rating - The rating value
 * @returns Formatted string with rating and count
 */
export function formatRatingWithCount(rating: any): string {
  const count = getRatingCount(rating);

  if (count === 0) {
    return 'No ratings yet';
  }

  const value = formatRating(rating);
  const reviewText = count === 1 ? 'review' : 'reviews';

  return `${value} (${count} ${reviewText})`;
}

/**
 * Get star rating component data
 * Returns filled and empty star counts
 *
 * @param rating - The rating value
 * @returns Object with filled and empty star counts
 */
export function getStarCounts(rating: any): { filled: number; empty: number; half: boolean } {
  const value = getRatingValue(rating);
  const filled = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  const empty = 5 - filled - (hasHalf ? 1 : 0);

  return {
    filled,
    half: hasHalf,
    empty
  };
}
