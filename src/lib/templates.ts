export type CampaignTemplates = {
  charge: string;
  reminder: string;
  overdue: string;
  thanks: string;
};

export const DEFAULT_TEMPLATES: CampaignTemplates = {
  charge: `Olá [Nome Participante]! Iniciamos o mês [Mês Atual] e faltam [Meses Restantes] meses para o nosso congresso! Vim te lembrar do compromisso mensal que temos com essa obra!

Efetue o pagamento no pix [Chave PIX]. O valor é de [Valor].

Lembrando que estão pendentes os pagamentos dos meses: [Meses Pendentes].

Se precisar de algo, só avisar!`,

  reminder: `Olá [Nome Participante], lembrando que o prazo para contribuição do valor de [Valor] para a campanha [Nome da Campanha] é do dia [Prazo Pagamento] de cada mês! Nos ajude nessa obra!`,

  overdue: `Olá [Nome Participante], notamos que você tem pagamentos em atraso na campanha [Nome da Campanha].

Meses em aberto: [Meses Pendentes].

Por favor, regularize o quanto antes via PIX: [Chave PIX]. Valor: [Valor].

Qualquer dúvida, estamos à disposição!`,

  thanks: `Olá [Nome Participante]! Muito obrigado pela sua contribuição de [Valor] para a campanha [Nome da Campanha]! Sua participação faz toda a diferença. Deus abençoe!`,
};

export const TEMPLATE_VARIABLES = [
  { key: '[Nome Participante]', label: 'Nome Participante' },
  { key: '[Mês Atual]', label: 'Mês Atual' },
  { key: '[Chave PIX]', label: 'Chave PIX' },
  { key: '[Valor]', label: 'Valor' },
  { key: '[Meses Pendentes]', label: 'Meses Pendentes' },
  { key: '[Meses Restantes]', label: 'Meses Restantes' },
  { key: '[Nome da Campanha]', label: 'Nome da Campanha' },
  { key: '[Prazo Pagamento]', label: 'Prazo Pagamento' },
] as const;

export const TEMPLATE_LABELS: Record<keyof CampaignTemplates, string> = {
  charge: 'Cobrança mensal',
  reminder: 'Lembrete de prazo',
  overdue: 'Aviso de atraso',
  thanks: 'Agradecimento',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ReplaceContext {
  participantName: string;
  pixKey: string;
  value: string;
  campaignName: string;
  currentMonth: string;
  pendingMonths: string;
  remainingMonths: string;
  paymentDeadline: string;
}

export function replaceVariables(template: string, ctx: ReplaceContext): string {
  // Sanitizar o template para prevenir XSS
  let result = escapeHtml(template);

  // Substituir variáveis com valores seguros (já escapados pelo contexto da aplicação)
  result = result
    .replace(/\[Nome Participante\]/g, escapeHtml(ctx.participantName))
    .replace(/\[Chave PIX\]/g, escapeHtml(ctx.pixKey))
    .replace(/\[Valor\]/g, escapeHtml(ctx.value))
    .replace(/\[Nome da Campanha\]/g, escapeHtml(ctx.campaignName))
    .replace(/\[Mês Atual\]/g, escapeHtml(ctx.currentMonth))
    .replace(/\[Meses Pendentes\]/g, escapeHtml(ctx.pendingMonths))
    .replace(/\[Meses Restantes\]/g, escapeHtml(ctx.remainingMonths))
    .replace(/\[Prazo Pagamento\]/g, escapeHtml(ctx.paymentDeadline));

  return result;
}

export function replaceVariablesPlain(template: string, ctx: ReplaceContext): string {
  return template
    .replace(/\[Nome Participante\]/g, ctx.participantName)
    .replace(/\[Chave PIX\]/g, ctx.pixKey)
    .replace(/\[Valor\]/g, ctx.value)
    .replace(/\[Nome da Campanha\]/g, ctx.campaignName)
    .replace(/\[Mês Atual\]/g, ctx.currentMonth)
    .replace(/\[Meses Pendentes\]/g, ctx.pendingMonths)
    .replace(/\[Meses Restantes\]/g, ctx.remainingMonths)
    .replace(/\[Prazo Pagamento\]/g, ctx.paymentDeadline);
}
