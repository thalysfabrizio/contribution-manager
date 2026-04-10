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
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
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
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
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
      className={`flex items-center gap-2 bg-card border rounded-lg px-4 py-3 shadow-lg min-w-[280px] animate-in ${variantClasses[t.variant]}`}
    >
      {icons[t.variant]}
      <span className="flex-1 text-sm text-text-primary">{t.message}</span>
      <button
        onClick={() => onRemove(t.id)}
        className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
}
