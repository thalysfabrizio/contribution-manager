'use client';

import { useState } from 'react';
import { Wand2, CalendarClock, ExternalLink, CheckCircle } from 'lucide-react';
import { confirmMessageSent } from '@/actions/message';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { isSameMonth, isCurrentMonth } from '@/lib/months';
import type { CampaignData } from '@/types';
import type { MonthEntry } from '@/lib/months';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: CampaignData['participants'][number] | null;
  campaign: CampaignData;
  months: MonthEntry[];
}

export function MessageModal({ isOpen, onClose, participant, campaign, months }: MessageModalProps) {
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [sentTemplate, setSentTemplate] = useState('');
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setStep('select');
    setConfirming(false);
    onClose();
  };

  if (!participant) return null;

  const now = new Date();

  const signature = campaign.messageSignature ? `\n\n${campaign.messageSignature}` : '';

  const getSmartMessageLink = () => {
    const currentMonthStr = now.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' });
    const remainingCount = months.filter(
      (m) =>
        m.date.getUTCFullYear() > now.getUTCFullYear() ||
        (m.date.getUTCFullYear() === now.getUTCFullYear() && m.date.getUTCMonth() >= now.getUTCMonth()),
    ).length;
    const pendingLabels = months
      .filter((m) => {
        const isPastOrPresent = m.date <= now || isCurrentMonth(m.date);
        if (!isPastOrPresent) return false;
        const payment = participant.payments.find((pay) => isSameMonth(pay.month, m.date));
        return !payment || payment.status === 'PENDING' || payment.status === 'LATE';
      })
      .map((m) => (isCurrentMonth(m.date) ? `${m.label} (mês atual)` : m.label));
    const pendingText =
      pendingLabels.length > 0
        ? `Lembrando que estão pendentes os pagamentos dos meses: ${pendingLabels.join(', ')}.`
        : 'Que maravilha, você está em dia!';
    const msg = `Olá! Iniciamos o mês ${currentMonthStr} e faltam ${remainingCount} meses para o nosso congresso! Vim te lembrar do compromisso mensal que temos com essa obra!\n\nEfetue o pagamento no pix ${campaign.pixKey}.\n\n${pendingText}\n\nSe precisar de algo, só avisar!${signature}`;
    return `https://wa.me/55${participant.person.phone}?text=${encodeURIComponent(msg)}`;
  };

  const getReminderMessageLink = () => {
    const msg = `Olá, lembrando que o prazo para contribuição do valor para o nosso congresso é do dia ${campaign.paymentDayStart} ao dia ${campaign.paymentDayEnd} de cada mês! Nos ajude nessa obra!${signature}`;
    return `https://wa.me/55${participant.person.phone}?text=${encodeURIComponent(msg)}`;
  };

  const templateOptions = [
    {
      key: 'charge',
      label: 'Cobrança Inteligente',
      description: 'Pendências + contagem regressiva',
      icon: Wand2,
      href: getSmartMessageLink(),
      accent: true,
    },
    {
      key: 'reminder',
      label: 'Lembrete de Prazo',
      description: `Dia ${campaign.paymentDayStart} ao ${campaign.paymentDayEnd}`,
      icon: CalendarClock,
      href: getReminderMessageLink(),
      accent: false,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'confirm' ? 'Confirmar Envio' : 'Enviar Mensagem'}
    >
      {step === 'select' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Para: <span className="text-text-primary font-medium">{participant.person.name}</span>
          </p>
          <div className="space-y-2.5">
            {templateOptions.map((opt) => (
              <a
                key={opt.key}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setSentTemplate(opt.key);
                  setStep('confirm');
                }}
                className={`flex items-center gap-3 w-full p-3.5 rounded-lg transition-all duration-200 no-underline min-h-[60px] group ${
                  opt.accent
                    ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15'
                    : 'border border-border text-text-secondary hover:bg-card-hover hover:text-text-primary'
                }`}
              >
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                  opt.accent ? 'bg-primary/15' : 'bg-card-hover'
                }`}>
                  <opt.icon size={18} aria-hidden="true" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs opacity-70">{opt.description}</span>
                </div>
                <ExternalLink size={14} className="opacity-40 group-hover:opacity-70 transition-opacity" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
      {step === 'confirm' && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 bg-success-bg rounded-lg p-4 border border-success/10">
            <CheckCircle size={20} className="text-success shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-text-primary">
              Você enviou a mensagem para{' '}
              <span className="font-medium">{participant.person.name}</span> pelo WhatsApp?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              disabled={confirming}
              onClick={async () => {
                setConfirming(true);
                const result = await confirmMessageSent(campaign.id, participant.id, sentTemplate);
                if (!result.ok) {
                  toast(result.error, 'error');
                } else {
                  toast('Envio registrado', 'success');
                }
                handleClose();
              }}
            >
              {confirming ? 'Registrando...' : 'Confirmo que enviei'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
