// Core Components
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export type { CardProps } from './Card';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// Layout Components
export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { BottomSheet } from './BottomSheet';
export type { BottomSheetProps } from './BottomSheet';

export { BottomNavigation, TopNavigation } from './Navigation';
export type { NavItem } from './Navigation';

export { Tabs } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

export { Divider } from './Divider';
export type { DividerProps } from './Divider';

// Form Components
export { Toggle, Checkbox, Radio } from './Toggle';
export type { ToggleProps, CheckboxProps, RadioProps } from './Toggle';

export { Slider } from './Slider';
export type { SliderProps } from './Slider';

export { Dropdown } from './Dropdown';
export type { DropdownProps, DropdownOption } from './Dropdown';

// Legacy Components (will be replaced)
// Note: These use default exports, so we re-export them as named exports
export { default as Alert } from './Alert';
export { default as Select } from './Select';
export { default as Textarea } from './Textarea';
export { default as Loading } from './Loading';

// Feedback Components
export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { Skeleton, CardSkeleton, ListSkeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Progress, StepProgress } from './Progress';
export type { ProgressProps, Step } from './Progress';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

export { Toast, ToastContainer } from './Toast';
export type { ToastProps } from './Toast';

// Toast helper
export const toast = {
  success: (message: string, options?: any) => console.log('Toast:', { type: 'success', message, ...options }),
  error: (message: string, options?: any) => console.error('Toast:', { type: 'error', message, ...options }),
  warning: (message: string, options?: any) => console.warn('Toast:', { type: 'warning', message, ...options }),
  info: (message: string, options?: any) => console.info('Toast:', { type: 'info', message, ...options }),
};
