import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMonthsFromRange, isSameMonth } from '@/lib/months';
import { PrintButton } from '@/components/print/PrintButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

function formatMonthRange(date: Date) {
  return date
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function brl(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export default async function PrintCampaignPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const member = await prisma.campaignMember.findUnique({
    where: { userId_campaignId: { userId: session.user.id, campaignId: id } },
  });
  if (!member) notFound();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          person: true,
          payments: { orderBy: { month: 'asc' } },
        },
        orderBy: { person: { name: 'asc' } },
      },
    },
  });
  if (!campaign) notFound();

  const months = getMonthsFromRange(campaign.startMonth, campaign.endMonth);
  const totalExpected = campaign.participants.length * campaign.monthlyValue * months.length;
  const paidCellsCount = campaign.participants.reduce(
    (acc, p) =>
      acc +
      p.payments.filter(
        (pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH',
      ).length,
    0,
  );
  const totalReceived = paidCellsCount * campaign.monthlyValue;

  const period = `${formatMonthRange(campaign.startMonth)} – ${formatMonthRange(campaign.endMonth)}`;
  const generatedAt = new Date().toLocaleString('pt-BR');

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 1.2cm; }
        @media print {
          header, nav, .no-print { display: none !important; }
          body { background: white !important; }
          .print-root { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: none !important; }
          .print-root table { page-break-inside: auto; }
          .print-root tr { page-break-inside: avoid; page-break-after: auto; }
          .print-root thead { display: table-header-group; }
        }
        .print-screen-bg { background: #e4e4e7; min-height: 100vh; padding: 24px 12px; }
        .print-root {
          max-width: 21cm;
          margin: 0 auto;
          padding: 1.4cm 1.2cm;
          background: white;
          color: #111;
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-size: 10.5pt;
          line-height: 1.4;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
        }
        .print-root h1 { font-size: 17pt; margin: 0 0 2px; font-weight: 700; color: #111; }
        .print-root h2 { font-size: 11pt; margin: 18px 0 8px; font-weight: 600; color: #111; border-bottom: 1px solid #d4d4d8; padding-bottom: 4px; }
        .print-root p { margin: 2px 0; }
        .print-root .meta { color: #52525b; font-size: 9.5pt; }
        .print-root .details p { margin: 3px 0; }
        .print-root .details strong { color: #18181b; display: inline-block; min-width: 170px; }
        .print-root table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 6px; }
        .print-root th, .print-root td { border: 1px solid #d4d4d8; padding: 4px 6px; text-align: left; vertical-align: middle; }
        .print-root th { background: #f4f4f5; font-weight: 600; }
        .print-root td.status, .print-root th.status { text-align: center; min-width: 22px; padding: 4px 2px; }
        .print-root tfoot td { background: #fafafa; font-weight: 600; }
        .status-paid-pix { background: #d1fae5; }
        .status-paid-cash { background: #dbeafe; }
        .status-late { background: #fef3c7; }
        .status-pending { color: #a1a1aa; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 8px 0; }
        .summary-box { border: 1px solid #d4d4d8; padding: 8px 10px; border-radius: 4px; }
        .summary-box .label { font-size: 9pt; color: #71717a; }
        .summary-box .value { font-size: 13pt; font-weight: 700; color: #111; }
        .legend { margin-top: 12px; font-size: 9pt; color: #52525b; }
        .legend span { display: inline-block; margin-right: 12px; }
        .legend .dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
      `}</style>

      <div className="print-screen-bg">
        <div className="no-print" style={{ maxWidth: '21cm', margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href={`/campaigns/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors bg-card border border-border rounded-lg px-3 min-h-[40px]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar para campanha
          </Link>
          <PrintButton />
        </div>

        <div className="print-root">
          <header>
            <h1>{campaign.orgName || campaign.name}</h1>
            {campaign.orgName && <p className="meta">{campaign.name}</p>}
            {campaign.description && <p style={{ marginTop: 6 }}>{campaign.description}</p>}
            <p className="meta" style={{ marginTop: 6 }}>
              Relatório gerado em {generatedAt}
            </p>
          </header>

          <h2>Dados da campanha</h2>
          <div className="details">
            <p><strong>Chave PIX:</strong> {campaign.pixKey}</p>
            <p><strong>Valor mensal:</strong> {brl(campaign.monthlyValue)}</p>
            <p><strong>Período:</strong> {period}</p>
            <p><strong>Prazo mensal:</strong> dias {campaign.paymentDayStart} a {campaign.paymentDayEnd}</p>
          </div>

          <h2>Resumo</h2>
          <div className="summary-grid">
            <div className="summary-box">
              <div className="label">Participantes</div>
              <div className="value">{campaign.participants.length}</div>
            </div>
            <div className="summary-box">
              <div className="label">Total esperado</div>
              <div className="value">{brl(totalExpected)}</div>
            </div>
            <div className="summary-box">
              <div className="label">Total recebido</div>
              <div className="value">{brl(totalReceived)}</div>
            </div>
          </div>

          <h2>Participantes e pagamentos</h2>
          {campaign.participants.length === 0 ? (
            <p className="meta">Nenhum participante cadastrado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  {months.map((m) => (
                    <th key={m.date.toISOString()} className="status">
                      {m.label}
                    </th>
                  ))}
                  <th className="status">Total</th>
                </tr>
              </thead>
              <tbody>
                {campaign.participants.map((p) => {
                  const paid = p.payments.filter(
                    (pay) => pay.status === 'PAID_PIX' || pay.status === 'PAID_CASH',
                  ).length;
                  return (
                    <tr key={p.id}>
                      <td>{p.person.name}</td>
                      <td>{p.person.phone || '—'}</td>
                      {months.map((m) => {
                        const pay = p.payments.find((pm) => isSameMonth(pm.month, m.date));
                        const s = pay?.status;
                        const cls =
                          s === 'PAID_PIX'
                            ? 'status-paid-pix'
                            : s === 'PAID_CASH'
                            ? 'status-paid-cash'
                            : s === 'LATE'
                            ? 'status-late'
                            : 'status-pending';
                        const ch =
                          s === 'PAID_PIX' ? 'P' : s === 'PAID_CASH' ? '$' : s === 'LATE' ? '!' : '—';
                        return (
                          <td key={m.date.toISOString()} className={`status ${cls}`}>
                            {ch}
                          </td>
                        );
                      })}
                      <td className="status">
                        <strong>
                          {paid}/{months.length}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <p className="legend">
            <span><span className="dot" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }} /> P = Pago (PIX)</span>
            <span><span className="dot" style={{ background: '#dbeafe', border: '1px solid #93c5fd' }} /> $ = Pago (Dinheiro)</span>
            <span><span className="dot" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }} /> ! = Atrasado</span>
            <span><span className="dot" style={{ background: '#fff', border: '1px solid #d4d4d8' }} /> — = Pendente</span>
          </p>
        </div>
      </div>
    </>
  );
}
