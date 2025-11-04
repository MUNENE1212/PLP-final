import React from 'react';
import { getRoleStyles, UserRole } from '@/utils/roleColors';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  showName?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * RoleBadge Component
 *
 * Displays a colored badge for user roles with optional icon and name.
 * Automatically applies role-specific colors that work in both light and dark modes.
 *
 * @example
 * // Full badge with icon and name
 * <RoleBadge role="technician" />
 *
 * // Icon only
 * <RoleBadge role="customer" showIcon showName={false} />
 *
 * // Custom size
 * <RoleBadge role="admin" size="lg" />
 */
const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  showName = true,
  size = 'sm',
  className,
}) => {
  const roleStyles = getRoleStyles(role);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        roleStyles.badge,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span>{roleStyles.emoji}</span>}
      {showName && <span>{roleStyles.name}</span>}
    </span>
  );
};

export default RoleBadge;
