/**
 * Haptic feedback patterns for mobile devices
 * Uses the Vibration API when available
 */

export const hapticPatterns = {
  // Simple taps
  light: 10,
  medium: 20,
  heavy: 30,

  // Complex patterns (arrays of vibration/pause durations in ms)
  success: [10, 50, 10],
  error: [20, 50, 20, 50, 20],
  warning: [10, 30, 10],
  notification: [15, 100, 15],

  // Interactions
  selection: 5,
  tap: 10,
  longPress: 25,

  // Gestures
  swipe: [5, 10, 5],
  pinch: 15,

  // Feedback
  confirm: [10, 30, 20, 30, 10],
  cancel: [20, 30, 20],
  delete: [30, 50, 30, 50, 30]
};

/**
 * Trigger haptic feedback
 * @param pattern - Number (duration in ms) or array of durations (vibrate, pause, vibrate...)
 * @returns true if vibration was triggered, false otherwise
 */
export const triggerHaptic = (pattern: number | number[]): boolean => {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    return navigator.vibrate(pattern);
  }
  return false;
};

/**
 * Light haptic feedback for subtle interactions
 */
export const hapticLight = (): boolean => triggerHaptic(hapticPatterns.light);

/**
 * Medium haptic feedback for standard interactions
 */
export const hapticMedium = (): boolean => triggerHaptic(hapticPatterns.medium);

/**
 * Heavy haptic feedback for important actions
 */
export const hapticHeavy = (): boolean => triggerHaptic(hapticPatterns.heavy);

/**
 * Success haptic pattern
 */
export const hapticSuccess = (): boolean => triggerHaptic(hapticPatterns.success);

/**
 * Error haptic pattern
 */
export const hapticError = (): boolean => triggerHaptic(hapticPatterns.error);

/**
 * Warning haptic pattern
 */
export const hapticWarning = (): boolean => triggerHaptic(hapticPatterns.warning);

/**
 * Notification haptic pattern
 */
export const hapticNotification = (): boolean => triggerHaptic(hapticPatterns.notification);

/**
 * Selection haptic feedback (very light)
 */
export const hapticSelection = (): boolean => triggerHaptic(hapticPatterns.selection);

/**
 * Tap haptic feedback
 */
export const hapticTap = (): boolean => triggerHaptic(hapticPatterns.tap);

/**
 * Long press haptic feedback
 */
export const hapticLongPress = (): boolean => triggerHaptic(hapticPatterns.longPress);

/**
 * Swipe haptic feedback
 */
export const hapticSwipe = (): boolean => triggerHaptic(hapticPatterns.swipe);

/**
 * Pinch haptic feedback
 */
export const hapticPinch = (): boolean => triggerHaptic(hapticPatterns.pinch);

/**
 * Confirm action haptic pattern
 */
export const hapticConfirm = (): boolean => triggerHaptic(hapticPatterns.confirm);

/**
 * Cancel action haptic pattern
 */
export const hapticCancel = (): boolean => triggerHaptic(hapticPatterns.cancel);

/**
 * Delete action haptic pattern
 */
export const hapticDelete = (): boolean => triggerHaptic(hapticPatterns.delete);

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
};

/**
 * Custom haptic feedback with specified pattern
 */
export const customHaptic = (pattern: number | number[]): boolean => {
  return triggerHaptic(pattern);
};
