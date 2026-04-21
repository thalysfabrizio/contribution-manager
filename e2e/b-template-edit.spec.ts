import { test, expect } from '@playwright/test';
import { resetData, seedCampaign, seedParticipant } from './helpers/db';
import { expectNoA11yViolations } from './helpers/axe';

test.beforeEach(async () => {
  await resetData();
});

test('B: edit charge template → persist on reload → WhatsApp link available', async ({ page }) => {
  const campaignId = await seedCampaign({ name: 'Template E2E' });
  await seedParticipant(campaignId, 'Maria B', '83998877665');

  const CUSTOM_MARKER = 'MARCADOR-E2E-CHARGE';
  await page.goto(`/campaigns/${campaignId}/settings`);
  await expectNoA11yViolations(page, 'campaign settings');

  const chargeTextarea = page.getByLabel('Template: Cobrança mensal');
  await expect(chargeTextarea).toBeVisible();
  await chargeTextarea.fill(`Olá [Nome Participante], ${CUSTOM_MARKER}.`);
  // Há três sanfonas com "Salvar" no header (Dados/Templates/Branding) — escopa ao #templates.
  await page.locator('#templates').getByRole('button', { name: 'Salvar', exact: true }).click();

  await expect(page.getByText('Templates salvos')).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(page.getByLabel('Template: Cobrança mensal')).toHaveValue(
    `Olá [Nome Participante], ${CUSTOM_MARKER}.`,
  );

  await page.goto(`/campaigns/${campaignId}`);
  await page.getByRole('button', { name: /Enviar mensagem para Maria B/ }).click();

  const whatsappLink = page.getByRole('link', { name: /Cobrança Inteligente/ });
  await expect(whatsappLink).toBeVisible();
  const href = await whatsappLink.getAttribute('href');
  expect(href).toMatch(/^https:\/\/wa\.me\/5583998877665\?text=/);
});
