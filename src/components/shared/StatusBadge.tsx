import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: 'PENDING',
      className: 'bg-amber-100 text-amber-800 border-amber-500',
    },
    SUBMITTED: {
      label: 'SUBMITTED',
      className: 'bg-blue-100 text-blue-800 border-blue-500',
    },
    COMPLETED: {
      label: 'COMPLETED',
      className: 'bg-green-100 text-green-800 border-green-500',
    },
    CANCELLED: {
      label: 'CANCELLED',
      className: 'bg-red-100 text-red-800 border-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border-2 transition-all duration-200',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
