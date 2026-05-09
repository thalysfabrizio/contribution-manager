'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { useToast } from '@/components/ui/Toast';
import { createEvent, updateEvent } from '@/actions/event';
import type { ActionResult } from '@/lib/errors';
import type { EventStatus } from '@/generated/prisma/client';

type EventFormData = {
  id?: string;
  name?: string;
  description?: string | null;
  eventDate?: Date;
  status?: EventStatus;
};

interface EventFormProps {
  campaignId: string;
  event?: EventFormData;
}

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Planejado' },
  { value: 'ONGOING', label: 'Em andamento' },
  { value: 'FINISHED', label: 'Finalizado' },
  { value: 'CANCELED', label: 'Cancelado' },
];

function toDateInput(date?: Date): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export function EventForm({ campaignId, event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!event?.id;

  const submit = async (
    _prev: ActionResult<unknown> | null,
    formData: FormData,
  ): Promise<ActionResult<unknown>> => {
    if (isEditing && event?.id) {
      const result = await updateEvent(event.id, formData);
      if (!result.ok) {
        toast(result.error, 'error');
      } else {
        toast('Evento atualizado', 'success');
        router.push(`/campaigns/${campaignId}/eventos/${event.id}`);
      }
      return result;
    }

    const result = await createEvent(campaignId, formData);
    if (!result.ok) {
      toast(result.error, 'error');
    } else {
      toast('Evento criado', 'success');
      router.push(`/campaigns/${campaignId}/eventos/${result.data.eventId}`);
    }
    return result;
  };

  const [, formAction] = useActionState(submit, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        name="name"
        label="Nome do evento"
        defaultValue={event?.name ?? ''}
        placeholder="Ex.: Festa Junina 2026"
        required
        maxLength={120}
      />

      <Textarea
        name="description"
        label="Descrição (opcional)"
        defaultValue={event?.description ?? ''}
        placeholder="Detalhes do evento, local, etc."
        maxLength={500}
        rows={3}
      />

      <Input
        name="eventDate"
        type="date"
        label="Data do evento"
        defaultValue={toDateInput(event?.eventDate)}
        required
      />

      <div className="space-y-1.5">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-text-secondary"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={event?.status ?? 'PLANNED'}
          className="w-full rounded-lg border border-border bg-app px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            isEditing && event?.id
              ? router.push(`/campaigns/${campaignId}/eventos/${event.id}`)
              : router.push(`/campaigns/${campaignId}/eventos`)
          }
        >
          Cancelar
        </Button>
        <SubmitButton>{isEditing ? 'Salvar' : 'Criar evento'}</SubmitButton>
      </div>
    </form>
  );
}
