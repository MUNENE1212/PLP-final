import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

/**
 * Badge component for status indicators and labels
 *
 * @example
 * ```tsx
 * <Badge variant="success" size="md">
 *   Active
 * </Badge>
 * ```
 */
const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium';

    const variantClasses = {
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
      secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300',
      success: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
      warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
      error: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
      info: 'bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-300',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    const dotClasses = dot ? 'pl-1.5' : '';

    const combinedClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      dotClasses,
      className
    );

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
