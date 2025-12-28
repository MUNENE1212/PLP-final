import toast, { Toaster as ToastToaster } from 'react-hot-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'info', duration }: ToastOptions) => {
    const message = title || description || '';

    switch (variant) {
      case 'success':
        toast.success(message, {
          duration: duration || 3000,
        });
        if (description && title) {
          toast.success(description, {
            duration: duration || 3000,
          });
        }
        break;
      case 'error':
        toast.error(message, {
          duration: duration || 4000,
        });
        if (description && title) {
          toast.error(description, {
            duration: duration || 4000,
          });
        }
        break;
      case 'warning':
        toast(message, {
          duration: duration || 3000,
          icon: '⚠️',
        });
        if (description && title) {
          toast(description, {
            duration: duration || 3000,
            icon: '⚠️',
          });
        }
        break;
      default:
        toast(message, {
          duration: duration || 3000,
        });
        if (description && title) {
          toast(description, {
            duration: duration || 3000,
          });
        }
    }
  };

  return {
    toast: showToast,
    success: (options: Omit<ToastOptions, 'variant'>) => showToast({ ...options, variant: 'success' }),
    error: (options: Omit<ToastOptions, 'variant'>) => showToast({ ...options, variant: 'error' }),
    info: (options: Omit<ToastOptions, 'variant'>) => showToast({ ...options, variant: 'info' }),
    warning: (options: Omit<ToastOptions, 'variant'>) => showToast({ ...options, variant: 'warning' }),
  };
};
