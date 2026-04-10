'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignOwner } from '@/lib/permissions';
import { emailSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function inviteMember(campaignId: string, email: string) {
  const { user } = await requireCampaignOwner(campaignId);

  const normalizedEmail = emailSchema.parse(email);

  // Verificar se já é membro
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const existingMember = await prisma.campaignMember.findUnique({
      where: {
        userId_campaignId: {
          userId: existingUser.id,
          campaignId,
        },
      },
    });

    if (existingMember) {
      throw new Error('Esta pessoa já é membro desta campanha');
    }

    // Adicionar diretamente
    await prisma.campaignMember.create({
      data: {
        userId: existingUser.id,
        campaignId,
        role: 'MEMBER',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_INVITED',
        entity: 'CampaignMember',
        details: { email: normalizedEmail, method: 'direct' },
        userId: user.id,
        campaignId,
      },
    });

    revalidatePath(`/campaigns/${campaignId}/settings`);
    return { method: 'direct' as const };
  }

  // Usuário não existe — gerar link de convite
  // Criar o user para que o NextAuth possa vincular no primeiro login
  const invitedUser = await prisma.user.create({
    data: { email: normalizedEmail },
  });

  await prisma.campaignMember.create({
    data: {
      userId: invitedUser.id,
      campaignId,
      role: 'MEMBER',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'MEMBER_INVITED',
      entity: 'CampaignMember',
      details: { email: normalizedEmail, method: 'invite' },
      userId: user.id,
      campaignId,
    },
  });

  revalidatePath(`/campaigns/${campaignId}/settings`);
  return { method: 'invite' as const };
}

export async function removeMember(campaignId: string, memberId: string) {
  const { user } = await requireCampaignOwner(campaignId);

  const member = await prisma.campaignMember.findUnique({
    where: { id: memberId },
    include: { user: true },
  });

  if (!member) throw new Error('Membro não encontrado');
  if (member.role === 'OWNER') throw new Error('Não é possível remover o proprietário');

  await prisma.campaignMember.delete({ where: { id: memberId } });

  await prisma.auditLog.create({
    data: {
      action: 'MEMBER_REMOVED',
      entity: 'CampaignMember',
      entityId: memberId,
      details: { email: member.user.email },
      userId: user.id,
      campaignId,
    },
  });

  revalidatePath(`/campaigns/${campaignId}/settings`);
}
