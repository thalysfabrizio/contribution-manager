import { getMonthsFromRange, isSameMonth } from '@/lib/months';
import type { CampaignData } from '@/types';

interface CampaignPrintReportProps {
  data: CampaignData;
  orgName: string | null;
}

function formatMonthRange(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function brl(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function currentMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function CampaignPrintReport({ data, orgName }: CampaignPrintReportProps) {
  const months = getMonthsFromRange(data.startMonth, data.endMonth);
  const totalCells = data.participants.length * months.length;
  const totalExpected = totalCells * data.monthlyValue;

  const paidCells = data.participants.flatMap((p) =>
    p.payments.filter((pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH'),
  );
  const paidCellsCount = paidCells.length;
  const pixCount = paidCells.filter((pay) => pay.status === 'PAID_PIX').length;
  const cashCount = paidCellsCount - pixCount;

  const totalReceived = paidCellsCount * data.monthlyValue;
  const outstanding = totalExpected - totalReceived;
  const percent = totalCells > 0 ? Math.round((paidCellsCount / totalCells) * 100) : 0;

  const period = `${formatMonthRange(data.startMonth)} – ${formatMonthRange(data.endMonth)}`;
  const generatedAt = new Date().toLocaleString('pt-BR');

  const cmStart = currentMonthStart();
  const pastMonths = months.filter((m) => m.date < cmStart);

  const participantStatus = data.participants.map((p) => {
    const openLabels = pastMonths
      .filter((m) => {
        const pay = p.payments.find((pm) => isSameMonth(pm.month, m.date));
        return !pay || (pay.status !== 'PAID_PIX' && pay.status !== 'PAID_CASH');
      })
      .map((m) => m.label);
    return { participant: p, openLabels };
  });

  const pendencias = participantStatus.filter((s) => s.openLabels.length > 0);
  const emDia = participantStatus.filter((s) => s.openLabels.length === 0);

  const monthlyProgress = months.map((m) => {
    const paid = data.participants.filter((p) =>
      p.payments.some(
        (pay) =>
          isSameMonth(pay.month, m.date) &&
          (pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH'),
      ),
    ).length;
    const pct = data.participants.length > 0 ? (paid / data.participants.length) * 100 : 0;
    return { month: m, paid, pct };
  });

  return (
    <div className="print-report">
      <header className="pr-head">
        <div>
          <h1>{orgName || data.name}</h1>
          {orgName && <div className="pr-sub">{data.name}</div>}
        </div>
        <div className="pr-head-meta">
          <div className="pr-period">{period}</div>
          {/* suppressHydrationWarning: o timestamp usa hora do momento do render —
              server e client renderizam instantes diferentes; esse delta é esperado. */}
          <div className="pr-muted" suppressHydrationWarning>Gerado em {generatedAt}</div>
        </div>
      </header>

      {data.description && <p className="pr-description">{data.description}</p>}

      <section className="pr-kpis">
        <div className="pr-kpi">
          <div className="pr-kpi-label">Participantes</div>
          <div className="pr-kpi-value">{data.participants.length}</div>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-label">Arrecadação prevista</div>
          <div className="pr-kpi-value">{brl(totalExpected)}</div>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-label">Arrecadado</div>
          <div className="pr-kpi-value">{brl(totalReceived)}</div>
          <div className="pr-kpi-sub">{percent}% concluído</div>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-label">A receber</div>
          <div className="pr-kpi-value">{brl(outstanding)}</div>
        </div>
      </section>

      <section className="pr-meta-row">
        <div><span className="pr-meta-label">PIX</span> {data.pixKey}</div>
        <div><span className="pr-meta-label">Valor mensal</span> {brl(data.monthlyValue)}</div>
        <div><span className="pr-meta-label">Janela</span> dias {data.paymentDayStart} a {data.paymentDayEnd}</div>
      </section>

      {data.participants.length > 0 && (
        <section className="pr-section">
          <h2>Progresso mensal</h2>
          <ul className="pr-progress">
            {monthlyProgress.map(({ month, paid, pct }) => (
              <li key={month.date.toISOString()}>
                <span className="pr-progress-month">{month.label}</span>
                <span className="pr-progress-bar" aria-hidden="true">
                  <span className="pr-progress-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="pr-progress-count">{paid}/{data.participants.length}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.participants.length > 0 && (
        <section className="pr-section pr-two-col">
          <div className={pendencias.length === 0 ? 'pr-col-empty' : ''}>
            <h2>Pendências em aberto ({pendencias.length})</h2>
            {pendencias.length === 0 ? (
              <p className="pr-muted">Nenhuma pendência — todos os participantes em dia.</p>
            ) : (
              <ul className="pr-list">
                {pendencias.map(({ participant, openLabels }) => (
                  <li key={participant.id}>
                    <strong>{participant.person.name}</strong>
                    {participant.person.phone && (
                      <span className="pr-muted"> · {participant.person.phone}</span>
                    )}
                    <div className="pr-list-sub">
                      {openLabels.length} mês(es): {openLabels.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={emDia.length === 0 ? 'pr-col-empty' : ''}>
            <h2>Contribuições em dia ({emDia.length})</h2>
            {emDia.length === 0 ? (
              <p className="pr-muted">Nenhum participante totalmente em dia ainda.</p>
            ) : (
              <ul className="pr-list pr-list-compact">
                {emDia.map(({ participant }) => (
                  <li key={participant.id}>
                    <strong>{participant.person.name}</strong>
                    {participant.person.phone && (
                      <span className="pr-muted"> · {participant.person.phone}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <footer className="pr-footer-summary">
        <span><strong>{paidCellsCount}</strong> pagamentos confirmados</span>
        <span className="pr-sep">·</span>
        <span><strong>{pixCount}</strong> via PIX</span>
        <span className="pr-sep">·</span>
        <span><strong>{cashCount}</strong> em dinheiro</span>
      </footer>
    </div>
  );
}
