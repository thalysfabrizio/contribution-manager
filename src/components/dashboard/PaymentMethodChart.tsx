'use client';

import { useState } from 'react';
import { CreditCard, Zap, Banknote } from 'lucide-react';
import type { CampaignData } from '@/types';

interface PaymentMethodChartProps {
  participants: CampaignData['participants'];
}

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 130;
const GAP_DEG = 0;
const EXPLODE_DIST = 10;

function polar(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function pieSlicePath(startAngle: number, endAngle: number) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const start = polar(R, startAngle);
  const end = polar(R, endAngle);
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function explodeVec(startAngle: number, endAngle: number) {
  const mid = (startAngle + endAngle) / 2;
  const rad = ((mid - 90) * Math.PI) / 180;
  return { dx: EXPLODE_DIST * Math.cos(rad), dy: EXPLODE_DIST * Math.sin(rad) };
}

type SliceKey = 'pix' | 'cash';

export function PaymentMethodChart({ participants }: PaymentMethodChartProps) {
  const [active, setActive] = useState<SliceKey | null>(null);

  let pixCount = 0;
  let cashCount = 0;
  participants.forEach((p) => {
    p.payments.forEach((pay) => {
      if (pay.status === 'PAID_PIX') pixCount++;
      if (pay.status === 'PAID_CASH') cashCount++;
    });
  });

  const total = pixCount + cashCount;
  const pixPct = total > 0 ? Math.round((pixCount / total) * 100) : 0;
  const cashPct = total > 0 ? 100 - pixPct : 0;

  const pixAngle = (pixCount / Math.max(total, 1)) * 360;
  const pixStart = GAP_DEG / 2;
  const pixEnd = pixAngle - GAP_DEG / 2;
  const cashStart = pixAngle + GAP_DEG / 2;
  const cashEnd = 360 - GAP_DEG / 2;

  const onlyPix = pixCount > 0 && cashCount === 0;
  const onlyCash = cashCount > 0 && pixCount === 0;

  const pixOffset = explodeVec(pixStart, pixEnd);
  const cashOffset = explodeVec(cashStart, cashEnd);

  const pixTooltipPos = onlyPix ? { x: CX, y: CY } : polar(R * 0.7, (pixStart + pixEnd) / 2);
  const cashTooltipPos = onlyCash ? { x: CX, y: CY } : polar(R * 0.7, (cashStart + cashEnd) / 2);

  const tooltip = (() => {
    if (!active) return null;
    if (active === 'pix') {
      return { pos: pixTooltipPos, label: 'PIX', count: pixCount, pct: pixPct, color: 'var(--color-success)' };
    }
    return { pos: cashTooltipPos, label: 'Dinheiro', count: cashCount, pct: cashPct, color: 'var(--color-info)' };
  })();

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Métodos de Pagamento</h3>
      {total === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="size-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-3">
            <CreditCard size={24} className="text-primary/60" aria-hidden="true" />
          </div>
          <p className="text-sm text-text-muted">Nenhum pagamento registrado ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative"
            role="img"
            aria-label={`Métodos de pagamento: PIX ${pixPct}% e Dinheiro ${cashPct}%`}
          >
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="drop-shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
            >
              {onlyPix || onlyCash ? (
                <g
                  onMouseEnter={() => setActive(onlyPix ? 'pix' : 'cash')}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive((current) => (current ? null : onlyPix ? 'pix' : 'cash'))}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill={onlyPix ? 'var(--color-success)' : 'var(--color-info)'}
                  />
                </g>
              ) : (
                <>
                  <g
                    onMouseEnter={() => setActive('pix')}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => setActive((current) => (current === 'pix' ? null : 'pix'))}
                    transform={active === 'pix' ? `translate(${pixOffset.dx}, ${pixOffset.dy})` : undefined}
                    style={{ transition: 'transform 180ms ease-out', cursor: 'pointer' }}
                  >
                    <path
                      d={pieSlicePath(pixStart, pixEnd)}
                      fill="var(--color-success)"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g
                    onMouseEnter={() => setActive('cash')}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => setActive((current) => (current === 'cash' ? null : 'cash'))}
                    transform={active === 'cash' ? `translate(${cashOffset.dx}, ${cashOffset.dy})` : undefined}
                    style={{ transition: 'transform 180ms ease-out', cursor: 'pointer' }}
                  >
                    <path
                      d={pieSlicePath(cashStart, cashEnd)}
                      fill="var(--color-info)"
                      strokeLinejoin="round"
                    />
                  </g>
                </>
              )}
            </svg>
            {tooltip && (
              <div
                className="pointer-events-none absolute z-20 rounded-lg bg-app border border-border shadow-xl px-3 py-2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap animate-fade-in"
                style={{
                  left: `${(tooltip.pos.x / SIZE) * 100}%`,
                  top: `${(tooltip.pos.y / SIZE) * 100}%`,
                }}
                role="tooltip"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ background: tooltip.color }}
                    aria-hidden="true"
                  />
                  <span className="text-text-primary text-sm font-medium">{tooltip.label}</span>
                </div>
                <div className="text-xl font-bold text-text-primary tabular-nums leading-none mt-1">
                  {tooltip.pct}%
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {tooltip.count} {tooltip.count === 1 ? 'pagamento' : 'pagamentos'}
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col items-center gap-3">
            <div className="text-sm text-text-muted">
              Total de{' '}
              <span className="text-text-primary font-semibold tabular-nums">{total}</span>{' '}
              {total === 1 ? 'pagamento' : 'pagamentos'}
            </div>
            <ul className="flex items-center justify-center gap-5 flex-wrap">
              {pixCount > 0 && (
                <li className="flex items-center gap-2.5">
                  <div
                    className="size-9 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Zap size={16} className="text-success" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-text-secondary">PIX</div>
                    <div className="text-sm tabular-nums">
                      <span className="font-semibold text-text-primary">{pixCount}</span>
                      <span className="text-text-muted"> · {pixPct}%</span>
                    </div>
                  </div>
                </li>
              )}
              {cashCount > 0 && (
                <li className="flex items-center gap-2.5">
                  <div
                    className="size-9 rounded-lg bg-info/10 border border-info/30 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Banknote size={16} className="text-info" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-text-secondary">Dinheiro</div>
                    <div className="text-sm tabular-nums">
                      <span className="font-semibold text-text-primary">{cashCount}</span>
                      <span className="text-text-muted"> · {cashPct}%</span>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
