'use client';

import { useState } from 'react';
import { Wand2, CalendarClock } from 'lucide-react';
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
  const { toast } = useToast();

  const handleClose = () => {
    setStep('select');
    onClose();
  };

  if (!participant) return null;

  const getSmartMessageLink = () => {
    const today = new Date();
    const currentMonthStr = today.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' });
    const remainingCount = months.filter(
      (m) =>
        m.date.getUTCFullYear() > today.getFullYear() ||
        (m.date.getUTCFullYear() === today.getFullYear() && m.date.getUTCMonth() >= today.getMonth()),
    ).length;
    const pendingLabels = months
      .filter((m) => {
        const isPastOrPresent = m.date <= today || isCurrentMonth(m.date);
        if (!isPastOrPresent) return false;
        const payment = participant.payments.find((pay) => isSameMonth(pay.month, m.date));
        return !payment || payment.status === 'PENDING' || payment.status === 'LATE';
      })
      .map((m) => (isCurrentMonth(m.date) ? `${m.label} (mês atual)` : m.label));
    const pendingText =
      pendingLabels.length > 0
        ? `Lembrando que estão pendentes os pagamentos dos meses: ${pendingLabels.join(', ')}.`
        : 'Que maravilha, você está em dia!';
    const msg = `Olá! Iniciamos o mês ${currentMonthStr} e faltam ${remainingCount} meses para o nosso congresso! Vim te lembrar do compromisso mensal que temos com essa obra!\n\nEfetue o pagamento no pix ${campaign.pixKey}.\n\n${pendingText}\n\nSe precisar de algo, só avisar!`;
    return `https://wa.me/55${participant.person.phone}?text=${encodeURIComponent(msg)}`;
  };

  const getReminderMessageLink = () => {
    const msg = `Olá, lembrando que o prazo para contribuição do valor para o nosso congresso é do dia ${campaign.paymentDayStart} ao dia ${campaign.paymentDayEnd} de cada mês! Nos ajude nessa obra!`;
    return `https://wa.me/55${participant.person.phone}?text=${encodeURIComponent(msg)}`;
  };

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
          <div className="space-y-3">
            <a
              href={getSmartMessageLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setSentTemplate('charge');
                setStep('confirm');
              }}
              className="flex items-center gap-3 w-full p-3 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all duration-200 no-underline"
            >
              <Wand2 size={20} />
              <div className="text-left">
                <span className="block text-sm font-medium">Cobrança Inteligente</span>
                <span className="block text-xs opacity-80">Aviso de pendências + Contagem regressiva</span>
              </div>
            </a>
            <a
              href={getReminderMessageLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setSentTemplate('reminder');
                setStep('confirm');
              }}
              className="flex items-center gap-3 w-full p-3 border border-border rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-all duration-200 no-underline"
            >
              <CalendarClock size={20} />
              <div className="text-left">
                <span className="block text-sm font-medium">Lembrete de Prazo</span>
                <span className="block text-xs opacity-80">
                  Dia {campaign.paymentDayStart}-{campaign.paymentDayEnd}
                </span>
              </div>
            </a>
          </div>
        </div>
      )}
      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Você enviou a mensagem para{' '}
            <span className="text-text-primary font-medium">{participant.person.name}</span> pelo WhatsApp?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                try {
                  await confirmMessageSent(campaign.id, participant.id, sentTemplate);
                  toast('Envio registrado', 'success');
                } catch {
                  toast('Erro ao registrar envio', 'error');
                }
                handleClose();
              }}
            >
              Confirmo que enviei
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
