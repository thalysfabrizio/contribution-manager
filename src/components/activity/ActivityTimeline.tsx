'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ActivityItem } from './ActivityItem';
import { loadMoreActivity } from '@/actions/activity';
import { useToast } from '@/components/ui/Toast';
import { History, ChevronDown } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

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
  const { toast } = useToast();

  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  const [prevInitialHasMore, setPrevInitialHasMore] = useState(initialHasMore);
  if (prevInitialItems !== initialItems || prevInitialHasMore !== initialHasMore) {
    setPrevInitialItems(initialItems);
    setPrevInitialHasMore(initialHasMore);
    setItems(initialItems);
    setHasMore(initialHasMore);
  }

  const loadMore = async () => {
    setLoading(true);
    const lastItem = items[items.length - 1];
    const result = await loadMoreActivity(campaignId, lastItem?.id);
    setLoading(false);
    if (!result.ok) {
      toast(result.error, 'error');
      return;
    }
    setItems([...items, ...result.data.items]);
    setHasMore(result.data.hasMore);
  };

  if (items.length === 0) {
    return (
      <CollapsibleSection id="activity" title="Atividade Recente" defaultOpen={false}>
        <EmptyState
          icon={<History size={32} className="text-primary/60" aria-hidden="true" />}
          title="Nenhuma atividade ainda"
          description="As acoes realizadas na campanha aparecerão aqui."
        />
      </CollapsibleSection>
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
    <CollapsibleSection id="activity" title="Atividade Recente" defaultOpen={false}>
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
    </CollapsibleSection>
  );
}
