import React, { useId } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id: externalId, ...props }, ref) => {
    const autoId = useId();
    const id = externalId || autoId;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-2 block text-sm font-medium text-blue-700 dark:text-blue-300 dark:text-blue-200">
            {label}
            {props.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={clsx(
            // WCAG 2.1 AA: Minimum 44px height for touch targets
            'flex h-11 w-full rounded-md border bg-white px-3 py-2.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:ring-offset-gray-900',
            error
              ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400'
              : 'border-gray-300 focus-visible:ring-primary-500 dark:border-gray-600 dark:focus-visible:ring-primary-400',
            className
          )}
          {...props}
        />
        {error && <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
