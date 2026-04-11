'use client';

import { useState } from 'react';
import { removeMember } from '@/actions/member';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { InviteMemberModal } from './InviteMemberModal';
import { useToast } from '@/components/ui/Toast';
import { UserPlus, Trash2, User } from 'lucide-react';

export interface MemberInfo {
  id: string;
  role: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface MemberListProps {
  campaignId: string;
  members: MemberInfo[];
}

export function MemberList({ campaignId, members }: MemberListProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; email: string }>({
    isOpen: false,
    id: '',
    email: '',
  });
  const { toast } = useToast();

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-text-primary">Líderes da Campanha</h2>
        <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus size={13} aria-hidden="true" />
          Convidar
        </Button>
      </div>

      <div className="space-y-1.5">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-card-hover/30 transition-colors -mx-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User size={14} className="text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-primary truncate">
                    {m.user.name || m.user.email}
                  </span>
                  <Badge variant={m.role === 'OWNER' ? 'success' : 'muted'}>
                    {m.role === 'OWNER' ? 'Proprietário' : 'Membro'}
                  </Badge>
                </div>
                {m.user.name && (
                  <span className="text-xs text-text-muted">{m.user.email}</span>
                )}
              </div>
            </div>
            {m.role !== 'OWNER' && (
              <button
                onClick={() => setDeleteConfirm({ isOpen: true, id: m.id, email: m.user.email })}
                className="size-9 inline-flex items-center justify-center rounded-lg text-danger/60 hover:text-danger hover:bg-danger-bg transition-colors duration-200 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                aria-label={`Remover ${m.user.email}`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        campaignId={campaignId}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', email: '' })}
        onConfirm={async () => {
          try {
            await removeMember(campaignId, deleteConfirm.id);
            toast('Membro removido', 'success');
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Erro ao remover', 'error');
          }
        }}
        title="Remover Membro"
        message={`Tem certeza que deseja remover ${deleteConfirm.email} da campanha?`}
        confirmLabel="Remover"
        variant="danger"
      />
    </Card>
  );
}
