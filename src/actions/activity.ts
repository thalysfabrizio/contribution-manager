'use server';

import { prisma } from '@/lib/prisma';
import { requireCampaignAccess } from '@/lib/permissions';
import type { ActivityEntry } from '@/components/activity/ActivityTimeline';

const PAGE_SIZE = 20;

export async function loadMoreActivity(
  campaignId: string,
  cursor?: string,
): Promise<{ items: ActivityEntry[]; hasMore: boolean }> {
  await requireCampaignAccess(campaignId);

  const logs = await prisma.auditLog.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: {
      user: { select: { name: true } },
    },
  });

  const hasMore = logs.length > PAGE_SIZE;
  const items = logs.slice(0, PAGE_SIZE).map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    details: log.details as Record<string, unknown>,
    userName: log.user.name,
    createdAt: log.createdAt,
  }));

  return { items, hasMore };
}
