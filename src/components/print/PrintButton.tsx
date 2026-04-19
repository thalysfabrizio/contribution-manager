'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-fg px-4 min-h-[40px] text-sm font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Printer size={16} aria-hidden="true" />
      Imprimir / Salvar PDF
    </button>
  );
}
