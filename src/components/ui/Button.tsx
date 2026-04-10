import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  ghost: 'bg-transparent text-text-secondary hover:bg-card-hover hover:text-text-primary',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  outline: 'bg-transparent text-text-secondary border border-border hover:bg-card-hover hover:text-text-primary',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-4 min-h-[44px] text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
