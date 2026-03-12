import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-circuit';

  const variants = {
    // Primary: Circuit Blue with LED glow effect
    primary: 'bg-circuit text-white hover:bg-circuit-600 shadow-led hover:shadow-led-lg',

    // Secondary: Wrench Purple with hover glow
    secondary: 'bg-wrench text-white hover:bg-wrench-600 shadow-led-purple hover:shadow-led-purple',

    // Outline: Steel Grey border, Circuit Blue on hover
    outline: 'border-2 border-steel bg-transparent text-bone hover:border-circuit hover:bg-hover hover:text-circuit',

    // Ghost: Circuit Blue, transparent with hover
    ghost: 'bg-transparent text-circuit hover:bg-hover',

    // Danger: Error red
    danger: 'bg-error text-white hover:bg-error-600',
  };

  const sizes = {
    // WCAG 2.1 AA requires minimum 44x44px touch targets
    sm: 'h-11 min-w-[44px] px-3 text-sm',   // 44px height
    md: 'h-12 min-w-[48px] px-4 py-2',      // 48px height (default)
    lg: 'h-14 min-w-[56px] px-6 text-lg',   // 56px height
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
