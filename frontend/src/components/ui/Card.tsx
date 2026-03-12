import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'default', ...props }) => {
  const variantStyles = {
    default: 'bg-charcoal border-steel hover:border-strong hover:shadow-mahogany',
    glass: 'glass-card hover:border-strong hover:shadow-mahogany',
    elevated: 'bg-elevated border-steel hover:border-strong hover:shadow-mahogany-lg',
  };

  return (
    <div className={clsx('rounded-lg border shadow-sm transition-all duration-200', variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div className={clsx('flex flex-col space-y-1.5 p-6 border-b border-subtle', className)} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => {
  return (
    <h3 className={clsx('text-xl font-semibold leading-none tracking-tight text-bone', className)} {...props}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className, ...props }) => {
  return <p className={clsx('text-sm text-steel', className)} {...props}>{children}</p>;
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => {
  return <div className={clsx('p-6 pt-0', className)} {...props}>{children}</div>;
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => {
  return <div className={clsx('flex items-center p-6 pt-0 border-t border-subtle', className)} {...props}>{children}</div>;
};
