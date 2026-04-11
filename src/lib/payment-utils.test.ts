import { PAYMENT_CYCLE, getNextStatus, getStatusDisplay } from './payment-utils';

describe('PAYMENT_CYCLE', () => {
  it('contém 4 status na ordem correta', () => {
    expect(PAYMENT_CYCLE).toEqual(['PAID_PIX', 'PAID_CASH', 'LATE', 'PENDING']);
  });
});

describe('getNextStatus', () => {
  it('retorna PAID_PIX quando undefined', () => {
    expect(getNextStatus(undefined)).toBe('PAID_PIX');
  });

  it('retorna PAID_PIX quando PENDING', () => {
    expect(getNextStatus('PENDING')).toBe('PAID_PIX');
  });

  it('cicla PAID_PIX → PAID_CASH', () => {
    expect(getNextStatus('PAID_PIX')).toBe('PAID_CASH');
  });

  it('cicla PAID_CASH → LATE', () => {
    expect(getNextStatus('PAID_CASH')).toBe('LATE');
  });

  it('cicla LATE → PENDING', () => {
    expect(getNextStatus('LATE')).toBe('PENDING');
  });

  it('cicla PENDING → PAID_PIX (volta ao início)', () => {
    expect(getNextStatus('PENDING')).toBe('PAID_PIX');
  });
});

describe('getStatusDisplay', () => {
  it('PAID_PIX → label "PIX", ariaLabel "Pago via PIX"', () => {
    const result = getStatusDisplay('PAID_PIX');
    expect(result.label).toBe('PIX');
    expect(result.ariaLabel).toBe('Pago via PIX');
  });

  it('PAID_CASH → label "R$", ariaLabel "Pago em dinheiro"', () => {
    const result = getStatusDisplay('PAID_CASH');
    expect(result.label).toBe('R$');
    expect(result.ariaLabel).toBe('Pago em dinheiro');
  });

  it('LATE → label "Atraso", ariaLabel "Atrasado"', () => {
    const result = getStatusDisplay('LATE');
    expect(result.label).toBe('Atraso');
    expect(result.ariaLabel).toBe('Atrasado');
  });

  it('undefined → label "—", ariaLabel "Pendente"', () => {
    const result = getStatusDisplay(undefined);
    expect(result.label).toBe('—');
    expect(result.ariaLabel).toBe('Pendente');
  });

  it('cada retorno inclui classes não-vazia', () => {
    const statuses = ['PAID_PIX', 'PAID_CASH', 'LATE', undefined] as const;
    for (const s of statuses) {
      expect(getStatusDisplay(s).classes.length).toBeGreaterThan(0);
    }
  });
});
