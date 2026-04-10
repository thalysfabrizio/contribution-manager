type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-bg text-success border-success/30',
  info: 'bg-info-bg text-info border-info/30',
  warning: 'bg-warning-bg text-warning border-warning/30',
  danger: 'bg-danger-bg text-danger border-danger/30',
  muted: 'bg-card text-text-muted border-border',
};

export function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
