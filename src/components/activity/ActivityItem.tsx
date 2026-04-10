import {
  CreditCard,
  UserPlus,
  UserMinus,
  Pencil,
  MessageCircle,
  FolderPlus,
  Settings,
  UserCheck,
  UserX,
} from 'lucide-react';
import type { ActivityEntry } from './ActivityTimeline';

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  PAYMENT_UPDATED: {
    icon: <CreditCard size={12} aria-hidden="true" />,
    label: 'Pagamento atualizado',
    color: 'text-success',
    bg: 'bg-success-bg',
  },
  PARTICIPANT_ADDED: {
    icon: <UserPlus size={12} aria-hidden="true" />,
    label: 'Participante adicionado',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  PARTICIPANT_EDITED: {
    icon: <Pencil size={12} aria-hidden="true" />,
    label: 'Participante editado',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  PARTICIPANT_REMOVED: {
    icon: <UserMinus size={12} aria-hidden="true" />,
    label: 'Participante removido',
    color: 'text-danger',
    bg: 'bg-danger-bg',
  },
  MESSAGE_SENT: {
    icon: <MessageCircle size={12} aria-hidden="true" />,
    label: 'Mensagem enviada',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  CAMPAIGN_CREATED: {
    icon: <FolderPlus size={12} aria-hidden="true" />,
    label: 'Campanha criada',
    color: 'text-success',
    bg: 'bg-success-bg',
  },
  CAMPAIGN_EDITED: {
    icon: <Settings size={12} aria-hidden="true" />,
    label: 'Campanha editada',
    color: 'text-warning',
    bg: 'bg-warning-bg',
  },
  MEMBER_INVITED: {
    icon: <UserCheck size={12} aria-hidden="true" />,
    label: 'Membro convidado',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  MEMBER_REMOVED: {
    icon: <UserX size={12} aria-hidden="true" />,
    label: 'Membro removido',
    color: 'text-danger',
    bg: 'bg-danger-bg',
  },
};

interface ActivityItemProps {
  item: ActivityEntry;
}

export function ActivityItem({ item }: ActivityItemProps) {
  const config = ACTION_CONFIG[item.action] ?? {
    icon: <Settings size={12} aria-hidden="true" />,
    label: item.action,
    color: 'text-text-muted',
    bg: 'bg-card-hover',
  };

  const details = item.details as Record<string, string>;
  const time = new Date(item.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let description = '';
  if (details.name) description = details.name;
  if (details.from && details.to) {
    description += description ? ' — ' : '';
    description += `${details.from} → ${details.to}`;
  }
  if (details.templateType) {
    description += description ? ' — ' : '';
    description += details.templateType;
  }

  return (
    <div className="flex items-start gap-2.5 py-1.5 group">
      <div className={`size-6 rounded-full ${config.bg} ${config.color} flex items-center justify-center shrink-0 mt-0.5`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-text-primary">{config.label}</span>
          <span className="text-xs text-text-muted tabular-nums">{time}</span>
        </div>
        {description && (
          <p className="text-xs text-text-secondary truncate mt-0.5">{description}</p>
        )}
        {item.userName && (
          <p className="text-xs text-text-muted mt-0.5">por {item.userName}</p>
        )}
      </div>
    </div>
  );
}
