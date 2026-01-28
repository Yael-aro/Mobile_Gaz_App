import { cn } from '@/lib/utils';

type StatusType = 'available' | 'in-use' | 'maintenance' | 'lost' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  available: { label: 'Disponible', className: 'status-available' },
  'in-use': { label: 'En service', className: 'status-in-use' },
  maintenance: { label: 'Maintenance', className: 'status-maintenance' },
  lost: { label: 'Perdue', className: 'status-lost' },
  success: { label: 'Succès', className: 'status-available' },
  warning: { label: 'Attention', className: 'status-maintenance' },
  danger: { label: 'Danger', className: 'status-lost' },
  info: { label: 'Info', className: 'status-in-use' },
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      'status-badge',
      config.className,
      sizeStyles[size]
    )}>
      {label || config.label}
    </span>
  );
}
