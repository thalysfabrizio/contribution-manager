import { auth } from './auth';
import { prisma } from './prisma';

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado');
  }
  const exists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!exists) {
    throw new Error('Não autorizado');
  }
  return { ...session.user, id: session.user.id };
}

export async function requireCampaignAccess(campaignId: string) {
  const user = await getSessionUser();

  const member = await prisma.campaignMember.findUnique({
    where: {
      userId_campaignId: {
        userId: user.id,
        campaignId,
      },
    },
  });

  if (!member) {
    throw new Error('Sem acesso a esta campanha');
  }

  return { user, member };
}

export async function requireCampaignOwner(campaignId: string) {
  const { user, member } = await requireCampaignAccess(campaignId);

  if (member.role !== 'OWNER') {
    throw new Error('Apenas o proprietário pode realizar esta ação');
  }

  return { user, member };
}
