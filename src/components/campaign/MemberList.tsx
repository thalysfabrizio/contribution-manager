'use client';

import { useState } from 'react';
import { removeMember } from '@/actions/member';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { InviteMemberModal } from './InviteMemberModal';
import { useToast } from '@/components/ui/Toast';
import { UserPlus, Trash2 } from 'lucide-react';

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
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">Líderes da Campanha</h2>
        <Button variant="outline" onClick={() => setInviteOpen(true)} className="text-xs">
          <UserPlus size={14} />
          Convidar
        </Button>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">
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
            {m.role !== 'OWNER' && (
              <button
                onClick={() => setDeleteConfirm({ isOpen: true, id: m.id, email: m.user.email })}
                className="p-2 rounded-md text-danger/70 hover:text-danger hover:bg-danger-bg transition-all duration-200"
                aria-label={`Remover ${m.user.email}`}
              >
                <Trash2 size={14} />
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
