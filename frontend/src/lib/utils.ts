import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ============================================
   DESIGN TOKEN ACCESS UTILITIES
   Rich Dark Design System for Dumu Waks
   ============================================ */

/**
 * Get CSS variable value with fallback
 * @param variable - CSS variable name (with or without -- prefix)
 * @param fallback - Fallback value if variable is not defined
 */
export function getToken(variable: string, fallback: string = ''): string {
  const varName = variable.startsWith('--') ? variable : `--${variable}`;
  return `var(${varName}${fallback ? `, ${fallback}` : ''})`;
}

/**
 * Get color token value
 */
export function colorToken(color: keyof typeof colorTokens): string {
  return getToken(colorTokens[color]);
}

/**
 * Rich Dark Design System Color Tokens
 * Maps semantic names to CSS variable names
 */
export const colorTokens = {
  // Background colors
  bgPrimary: '--dw-bg-primary',      // Deep Mahogany #261212
  bgSecondary: '--dw-bg-secondary',    // Iron Charcoal #1C1C1C
  bgTertiary: '--dw-bg-tertiary',
  bgElevated: '--dw-bg-elevated',
  bgHover: '--dw-bg-hover',
  bgActive: '--dw-bg-active',

  // Text colors
  textPrimary: '--dw-text-primary',    // Soft Bone #E0E0E0
  textSecondary: '--dw-text-secondary',  // Steel Grey #9BA4B0
  textTertiary: '--dw-text-tertiary',
  textDisabled: '--dw-text-disabled',
  textLink: '--dw-text-link',          // Circuit Blue #0090C5

  // Brand/Accent colors
  accentPrimary: '--dw-accent-primary',  // Circuit Blue #0090C5
  accentSecondary: '--dw-accent-secondary', // Wrench Purple #7D4E9F
  accentHover: '--dw-accent-hover',

  // Semantic colors
  success: '--dw-color-success',
  successBg: '--dw-color-success-bg',
  warning: '--dw-color-warning',
  warningBg: '--dw-color-warning-bg',
  error: '--dw-color-error',
  errorBg: '--dw-color-error-bg',
  info: '--dw-color-info',
  infoBg: '--dw-color-info-bg',

  // Border colors
  borderSubtle: '--dw-border-subtle',
  borderDefault: '--dw-border-default',
  borderStrong: '--dw-border-strong',
  borderFocus: '--dw-border-focus',
} as const;

/**
 * Spacing tokens
 */
export const spacingTokens = {
  0: '--dw-spacing-0',
  1: '--dw-spacing-1',
  2: '--dw-spacing-2',
  3: '--dw-spacing-3',
  4: '--dw-spacing-4',
  5: '--dw-spacing-5',
  6: '--dw-spacing-6',
  8: '--dw-spacing-8',
  10: '--dw-spacing-10',
  12: '--dw-spacing-12',
  16: '--dw-spacing-16',
  20: '--dw-spacing-20',
  24: '--dw-spacing-24',
} as const;

/**
 * Radius tokens
 */
export const radiusTokens = {
  none: '--dw-radius-none',
  sm: '--dw-radius-sm',
  md: '--dw-radius-md',
  lg: '--dw-radius-lg',
  xl: '--dw-radius-xl',
  '2xl': '--dw-radius-2xl',
  full: '--dw-radius-full',
} as const;

/**
 * Shadow tokens
 */
export const shadowTokens = {
  sm: '--dw-shadow-sm',
  md: '--dw-shadow-md',
  lg: '--dw-shadow-lg',
  xl: '--dw-shadow-xl',
  '2xl': '--dw-shadow-2xl',
  glass: '--dw-shadow-glass',
  glassLg: '--dw-shadow-glass-lg',
  led: '--dw-shadow-led',
  ledLg: '--dw-shadow-led-lg',
  ledPurple: '--dw-shadow-led-purple',
  brand: '--dw-shadow-brand',
  brandLg: '--dw-shadow-brand-lg',
  mahogany: '--dw-shadow-mahogany',
  mahoganyLg: '--dw-shadow-mahogany-lg',
} as const;

/**
 * Get inline style for dynamic design token usage
 * @param tokens - Object of token names to values
 */
export function tokenStyles(tokens: Record<string, string>): React.CSSProperties {
  const styles: React.CSSProperties = {};
  for (const [key, value] of Object.entries(tokens)) {
    styles[key as keyof React.CSSProperties] = getToken(value) as any;
  }
  return styles;
}

/**
 * Create a style object with LED glow effect
 * @param color - Base color for the glow (default: Circuit Blue)
 */
export function ledGlowStyle(color?: string): React.CSSProperties {
  return {
    boxShadow: color
      ? `0 0 10px ${color}40, 0 0 20px ${color}20`
      : getToken('--dw-shadow-led'),
  };
}

/**
 * Create gradient style
 * @param from - Start color
 * @param to - End color
 * @param direction - Gradient direction (default: 135deg)
 */
export function gradientStyle(
  from: string,
  to: string,
  direction: string = '135deg'
): React.CSSProperties {
  return {
    background: `linear-gradient(${direction}, ${from}, ${to})`,
  };
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

/**
 * Format distance to now (alias for timeAgo with slightly different format)
 * Returns human-readable time distance like "2 hours ago" or "just now"
 */
export function formatDistanceToNow(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}
