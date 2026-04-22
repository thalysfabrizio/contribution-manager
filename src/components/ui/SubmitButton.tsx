'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from './Button';

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'children'> {
  pendingLabel?: string;
  children: React.ReactNode;
  disabled?: boolean;
  form?: string;
}

export function SubmitButton({
  pendingLabel = 'Salvando...',
  children,
  disabled,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...rest}>
      {pending ? (
        <span className="flex items-center gap-1.5">
          <span className="size-3 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
