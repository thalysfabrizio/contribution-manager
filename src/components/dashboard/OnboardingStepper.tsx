import { CheckCircle, Circle } from 'lucide-react';

interface OnboardingStepperProps {
  hasParticipants: boolean;
  hasPayments: boolean;
}

export function OnboardingStepper({ hasParticipants, hasPayments }: OnboardingStepperProps) {
  // Só mostra se não completou tudo
  if (hasParticipants && hasPayments) return null;

  const steps = [
    { label: 'Campanha criada', done: true },
    { label: 'Adicionar participantes', done: hasParticipants },
    { label: 'Registrar pagamentos', done: hasPayments },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 animate-in">
      <p className="text-sm font-medium text-text-primary mb-3">Primeiros passos</p>
      {/* Mobile: vertical layout */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            {step.done ? (
              <CheckCircle size={20} className="text-success shrink-0" aria-hidden="true" />
            ) : (
              <Circle size={20} className="text-text-muted shrink-0" aria-hidden="true" />
            )}
            <span className={`text-sm ${step.done ? 'text-text-primary' : 'text-text-muted'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {/* Desktop: horizontal layout */}
      <div className="hidden md:flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2">
              {step.done ? (
                <CheckCircle size={20} className="text-success shrink-0" aria-hidden="true" />
              ) : (
                <Circle size={20} className="text-text-muted shrink-0" aria-hidden="true" />
              )}
              <span className={`text-sm ${step.done ? 'text-text-primary' : 'text-text-muted'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 h-px mx-3 shrink-0 ${step.done ? 'bg-success/40' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
