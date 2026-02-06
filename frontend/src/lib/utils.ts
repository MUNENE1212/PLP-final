import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ============================================
   ACCESSIBILITY UTILITIES
   ============================================ */

/**
 * Generate a unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateId(prefix: string = 'dw'): string {
  return `${prefix}-${idCounter++}`;
}

/**
 * Screen reader only - visually hide but keep accessible
 * Returns CSS class name for screen reader only content
 */
export const srOnly = 'sr-only';

/**
 * Focus visible utilities
 * Returns class that only shows focus ring when using keyboard
 */
export const focusVisible = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get safe animation duration based on reduced motion preference
 */
export function getAnimationDuration(normalDuration: number): number {
  return prefersReducedMotion() ? 0.01 : normalDuration;
}

/**
 * Announce message to screen readers via ARIA live region
 * Creates a temporary element, appends to DOM, then removes after announcement
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const element = document.createElement('div');
  element.setAttribute('aria-live', priority);
  element.setAttribute('aria-atomic', 'true');
  element.className = 'sr-only';
  element.textContent = message;

  document.body.appendChild(element);

  // Remove after announcement (typical screen reader delay)
  setTimeout(() => {
    document.body.removeChild(element);
  }, 1000);
}

/**
 * Trap focus within a container element (for modals, dialogs)
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  if (firstElement) {
    firstElement.focus();
  }

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Get aria-current value based on page/path
 */
export function getAriaCurrent(currentPath: string, itemPath: string): 'page' | undefined {
  return currentPath === itemPath ? 'page' : undefined;
}

/**
 * Generate ARIA attributes for icon buttons
 */
export function getIconButtonAria(label: string, pressed?: boolean): {
  role: string;
  'aria-label': string;
  'aria-pressed'?: boolean;
} {
  const attrs = {
    role: 'button',
    'aria-label': label,
  } as { role: string; 'aria-label': string; 'aria-pressed'?: boolean };

  if (pressed !== undefined) {
    attrs['aria-pressed'] = pressed;
  }

  return attrs;
}

/**
 * Calculate contrast ratio between two colors (for WCAG compliance)
 * Returns ratio from 1-21 (higher is better contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color (for contrast calculations)
 */
function getLuminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const [R, G, B] = [r, g, b].map((channel) => {
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Check if contrast meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAG_AA(foreground: string, background: string, largeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minimum = largeText ? 3 : 4.5;
  return ratio >= minimum;
}

/**
 * Check if contrast meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAG_AAA(foreground: string, background: string, largeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minimum = largeText ? 4.5 : 7;
  return ratio >= minimum;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncate text
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Calculate time ago
 */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
}
