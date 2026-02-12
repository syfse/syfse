import { cn } from '../../lib/utils';

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = 'Loading...', className }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="text-gray-500 dark:text-gray-400">{message}</div>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 text-gray-500 dark:text-gray-400', className)}>
      {message}
    </div>
  );
}
