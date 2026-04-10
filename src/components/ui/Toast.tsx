'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return context;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={16} aria-hidden="true" />,
  error: <XCircle size={16} aria-hidden="true" />,
  info: <Info size={16} aria-hidden="true" />,
};

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-success/30 text-success',
  error: 'border-danger/30 text-danger',
  info: 'border-info/30 text-info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[100] flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(t.id), 3000);
    return () => clearTimeout(timer);
  }, [t.id, onRemove]);

  return (
    <div
      role="status"
      className={`flex items-center gap-3 bg-card border rounded-lg px-4 py-3 shadow-lg min-w-[280px] md:max-w-sm animate-slide-up ${variantClasses[t.variant]}`}
    >
      {icons[t.variant]}
      <span className="flex-1 text-sm text-text-primary">{t.message}</span>
      <button
        onClick={() => onRemove(t.id)}
        className="size-7 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        aria-label="Fechar notificação"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
