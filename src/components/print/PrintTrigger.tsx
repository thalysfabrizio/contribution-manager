'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrintTriggerProps {
  label?: string;
  size?: 'default' | 'sm';
}

export function PrintTrigger({ label = 'Imprimir', size = 'default' }: PrintTriggerProps) {
  return (
    <Button onClick={() => window.print()} size={size}>
      <Printer size={16} aria-hidden="true" /> {label}
    </Button>
  );
}
