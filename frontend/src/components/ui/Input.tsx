import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

/**
 * Input component with label, error states, and icons
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   startIcon={<Mail />}
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      showPasswordToggle = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

    const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const baseClasses = 'input w-full rounded-xl border px-4 py-3.5 text-base transition-all duration-200 min-h-[48px]';

    const stateClasses = error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20 dark:border-error-400 dark:focus:border-error-400 dark:focus:ring-error-400/20'
      : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-neutral-700 dark:focus:border-primary-400 dark:focus:ring-primary-400/20';

    const bgClasses = 'bg-white dark:bg-neutral-900';
    const textClasses = 'text-neutral-900 placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500';
    const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : '';

    const combinedClasses = cn(
      baseClasses,
      stateClasses,
      bgClasses,
      textClasses,
      disabledClasses,
      'focus:outline-none focus:ring-2',
      startIcon && 'pl-12',
      (endIcon || showPasswordToggle || error) && 'pr-12',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="label mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={combinedClasses}
            disabled={disabled}
            {...props}
          />

          {(endIcon || showPasswordToggle || error) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {error && <AlertCircle className="w-5 h-5 text-error-500" />}
              {showPasswordToggle && type === 'password' && !error && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
              {endIcon && !showPasswordToggle && !error && (
                <div className="text-neutral-400">{endIcon}</div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error-500 dark:text-error-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
