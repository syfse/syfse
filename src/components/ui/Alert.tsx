import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200',
  success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200',
  warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'error', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-3 border text-sm', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
