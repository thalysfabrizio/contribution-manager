import {
  DEFAULT_TEMPLATES,
  TEMPLATE_VARIABLES,
  TEMPLATE_LABELS,
  replaceVariables,
  replaceVariablesPlain,
} from './templates';

const ctx = {
  participantName: 'João Silva',
  pixKey: 'pix@teste.com',
  value: 'R$ 50,00',
  campaignName: 'Campanha Teste',
  currentMonth: 'Abr/26',
  pendingMonths: 'Jan/26, Fev/26',
  remainingMonths: '8',
  paymentDeadline: 'do dia 10 ao dia 15',
};

describe('DEFAULT_TEMPLATES', () => {
  it('contém exatamente 4 templates', () => {
    const keys = Object.keys(DEFAULT_TEMPLATES);
    expect(keys).toEqual(['charge', 'reminder', 'overdue', 'thanks']);
  });

  it('cada template contém pelo menos uma variável', () => {
    for (const template of Object.values(DEFAULT_TEMPLATES)) {
      expect(template).toMatch(/\[.+?\]/);
    }
  });
});

describe('TEMPLATE_VARIABLES', () => {
  it('contém 8 variáveis com key e label', () => {
    expect(TEMPLATE_VARIABLES).toHaveLength(8);
    for (const v of TEMPLATE_VARIABLES) {
      expect(v).toHaveProperty('key');
      expect(v).toHaveProperty('label');
    }
  });
});

describe('TEMPLATE_LABELS', () => {
  it('contém labels para os 4 tipos', () => {
    expect(Object.keys(TEMPLATE_LABELS)).toEqual(['charge', 'reminder', 'overdue', 'thanks']);
  });
});

describe('replaceVariables (HTML-safe)', () => {
  it('substitui todas as 8 variáveis corretamente', () => {
    const template =
      '[Nome Participante] [Chave PIX] [Valor] [Nome da Campanha] [Mês Atual] [Meses Pendentes] [Meses Restantes] [Prazo Pagamento]';
    const result = replaceVariables(template, ctx);
    expect(result).toContain('João Silva');
    expect(result).toContain('pix@teste.com');
    expect(result).toContain('R$ 50,00');
    expect(result).toContain('Campanha Teste');
    expect(result).toContain('Abr/26');
    expect(result).toContain('Jan/26, Fev/26');
    expect(result).toContain('8');
    expect(result).toContain('do dia 10 ao dia 15');
    expect(result).not.toContain('[');
  });

  it('escapa HTML no template — previne XSS', () => {
    const result = replaceVariables('<script>alert("xss")</script>', ctx);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('escapa HTML nos valores de contexto', () => {
    const xssCtx = { ...ctx, participantName: '<img onerror="alert(1)">' };
    const result = replaceVariables('[Nome Participante]', xssCtx);
    expect(result).not.toContain('<img');
    expect(result).toContain('&lt;img');
  });

  it('escapa &, <, >, ", \'', () => {
    const result = replaceVariables('A & B < C > D "E" \'F\'', ctx);
    expect(result).toContain('&amp;');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#039;');
  });

  it('funciona com mesma variável repetida', () => {
    const result = replaceVariables('[Nome Participante] e [Nome Participante]', ctx);
    const occurrences = result.split('João Silva').length - 1;
    expect(occurrences).toBe(2);
  });
});

describe('replaceVariablesPlain (texto puro)', () => {
  it('substitui todas as 8 variáveis corretamente', () => {
    const template =
      '[Nome Participante] [Chave PIX] [Valor] [Nome da Campanha] [Mês Atual] [Meses Pendentes] [Meses Restantes] [Prazo Pagamento]';
    const result = replaceVariablesPlain(template, ctx);
    expect(result).toBe(
      'João Silva pix@teste.com R$ 50,00 Campanha Teste Abr/26 Jan/26, Fev/26 8 do dia 10 ao dia 15',
    );
  });

  it('NÃO escapa HTML — preserva caracteres especiais', () => {
    const result = replaceVariablesPlain('<script>alert("xss")</script>', ctx);
    expect(result).toContain('<script>');
  });
});
