'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActivityItem } from './ActivityItem';
import { loadMoreActivity } from '@/actions/activity';

export interface ActivityEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown>;
  userName: string | null;
  createdAt: Date;
}

interface ActivityTimelineProps {
  campaignId: string;
  initialItems: ActivityEntry[];
  hasMore: boolean;
}

export function ActivityTimeline({ campaignId, initialItems, hasMore: initialHasMore }: ActivityTimelineProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const lastItem = items[items.length - 1];
      const result = await loadMoreActivity(campaignId, lastItem?.id);
      setItems([...items, ...result.items]);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-text-muted">Nenhuma atividade registrada ainda.</p>
      </Card>
    );
  }

  // Agrupar por dia
  const grouped: Record<string, ActivityEntry[]> = {};
  items.forEach((item) => {
    const day = new Date(item.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item);
  });

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-base font-semibold text-text-primary mb-4">Atividade Recente</h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, dayItems]) => (
          <div key={day}>
            <h3 className="text-xs font-medium text-text-muted mb-2">{day}</h3>
            <div className="space-y-2">
              {dayItems.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={loadMore} disabled={loading}>
            {loading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </Card>
  );
}
