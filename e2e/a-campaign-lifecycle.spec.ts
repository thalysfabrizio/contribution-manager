import { test, expect } from '@playwright/test';
import { resetData, seedCampaign } from './helpers/db';

test.beforeEach(async () => {
  await resetData();
});

test('A: add participant → mark paid → export PDF', async ({ page, context }) => {
  const campaignId = await seedCampaign({ name: 'Campanha E2E' });

  await page.goto(`/campaigns/${campaignId}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Campanha E2E' })).toBeVisible();

  await page.getByRole('button', { name: /Novo Participante/ }).first().click();
  await page.getByLabel('Telefone').fill('83999111222');
  await page.getByLabel('Nome', { exact: true }).fill('Zé Participante');
  await page.getByRole('button', { name: 'Adicionar' }).click();

  const row = page.getByRole('row').filter({ hasText: 'Zé Participante' });
  await expect(row).toBeVisible({ timeout: 10_000 });
  await row.getByRole('button', { name: 'Pendente' }).first().click();
  await page.getByRole('menuitem', { name: 'Pago (PIX)' }).click();
  await expect(row.getByRole('button', { name: /PIX/ }).first()).toBeVisible();

  const printPagePromise = context.waitForEvent('page');
  await page.getByRole('link', { name: /Exportar/ }).click();
  const printPage = await printPagePromise;
  await printPage.waitForLoadState('domcontentloaded');
  await expect(printPage.getByText('Zé Participante')).toBeVisible();
  await expect(printPage.getByText('Campanha E2E')).toBeVisible();
});
