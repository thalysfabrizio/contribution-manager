import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'default' | 'sm' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  ghost: 'bg-transparent text-text-secondary hover:bg-card-hover hover:text-text-primary',
  danger: 'bg-danger/10 text-danger-text hover:bg-danger/20',
  outline: 'bg-transparent text-text-secondary border border-border hover:bg-card-hover hover:text-text-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'px-4 min-h-[44px] text-sm',
  sm: 'px-3 min-h-[36px] text-xs',
  icon: 'size-[44px] p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'default', className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
