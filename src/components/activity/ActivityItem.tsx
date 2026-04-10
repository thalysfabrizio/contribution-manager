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

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  PAYMENT_UPDATED: {
    icon: <CreditCard size={14} />,
    label: 'Pagamento atualizado',
    color: 'text-success',
  },
  PARTICIPANT_ADDED: {
    icon: <UserPlus size={14} />,
    label: 'Participante adicionado',
    color: 'text-primary',
  },
  PARTICIPANT_EDITED: {
    icon: <Pencil size={14} />,
    label: 'Participante editado',
    color: 'text-info',
  },
  PARTICIPANT_REMOVED: {
    icon: <UserMinus size={14} />,
    label: 'Participante removido',
    color: 'text-danger',
  },
  MESSAGE_SENT: {
    icon: <MessageCircle size={14} />,
    label: 'Mensagem enviada',
    color: 'text-info',
  },
  CAMPAIGN_CREATED: {
    icon: <FolderPlus size={14} />,
    label: 'Campanha criada',
    color: 'text-success',
  },
  CAMPAIGN_EDITED: {
    icon: <Settings size={14} />,
    label: 'Campanha editada',
    color: 'text-warning',
  },
  MEMBER_INVITED: {
    icon: <UserCheck size={14} />,
    label: 'Membro convidado',
    color: 'text-primary',
  },
  MEMBER_REMOVED: {
    icon: <UserX size={14} />,
    label: 'Membro removido',
    color: 'text-danger',
  },
};

interface ActivityItemProps {
  item: ActivityEntry;
}

export function ActivityItem({ item }: ActivityItemProps) {
  const config = ACTION_CONFIG[item.action] ?? {
    icon: <Settings size={14} />,
    label: item.action,
    color: 'text-text-muted',
  };

  const details = item.details as Record<string, string>;
  const time = new Date(item.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let description = '';
  if (details.name) description = details.name;
  if (details.from && details.to) {
    description += description ? ` — ` : '';
    description += `${details.from} → ${details.to}`;
  }
  if (details.templateType) {
    description += description ? ` — ` : '';
    description += details.templateType;
  }

  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-primary">{config.label}</span>
          <span className="text-xs text-text-muted">{time}</span>
        </div>
        {description && (
          <p className="text-xs text-text-secondary truncate">{description}</p>
        )}
        {item.userName && (
          <p className="text-xs text-text-muted">por {item.userName}</p>
        )}
      </div>
    </div>
  );
}
