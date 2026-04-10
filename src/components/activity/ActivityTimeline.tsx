'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActivityItem } from './ActivityItem';
import { loadMoreActivity } from '@/actions/activity';
import { History, ChevronDown } from 'lucide-react';

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
      <Card className="py-10 text-center">
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <History size={28} className="opacity-40" aria-hidden="true" />
          <p className="text-sm">Nenhuma atividade registrada ainda.</p>
        </div>
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
    <Card className="p-4 md:p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-4">Atividade Recente</h2>
      <div className="space-y-5">
        {Object.entries(grouped).map(([day, dayItems]) => (
          <div key={day}>
            <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">{day}</h3>
            <div className="space-y-1 border-l-2 border-border pl-3 ml-1">
              {dayItems.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-5 text-center">
          <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" />
                Carregando...
              </span>
            ) : (
              <>
                <ChevronDown size={14} aria-hidden="true" />
                Carregar mais
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
