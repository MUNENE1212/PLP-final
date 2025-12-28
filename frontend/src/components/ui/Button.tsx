import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" loading={isLoading}>
 *   Submit
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'btn inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200';

    // Variant classes
    const variantClasses = {
      primary: 'bg-gradient-primary text-white shadow-md hover:bg-primary-600 hover:shadow-primary active:scale-95',
      secondary: 'bg-secondary-500 text-white shadow-md hover:bg-secondary-600 hover:shadow-secondary active:scale-95',
      outline: 'border-2 border-primary-500 bg-transparent text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950',
      ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950',
      danger: 'bg-error-500 text-white shadow-md hover:bg-error-600 active:scale-95',
    };

    // Size classes
    const sizeClasses = {
      sm: 'min-h-[44px] px-4 py-2.5 text-sm',
      md: 'min-h-[48px] px-6 py-3 text-base',
      lg: 'min-h-[52px] px-8 py-4 text-lg',
    };

    // Icon button classes (no text, just icon)
    const iconOnlyClasses = children
      ? ''
      : 'min-w-[48px] min-h-[48px] px-3';

    const widthClass = fullWidth ? 'w-full' : '';

    const combinedClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      iconOnlyClasses,
      widthClass,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-neutral-900',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    );

    const content = (
      <>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
