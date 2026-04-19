import { test, expect } from '@playwright/test';
import { resetData } from './helpers/db';

test.beforeEach(async () => {
  await resetData();
});

test('A: create campaign → add participant → mark paid → export PDF', async ({ page, context }) => {
  await page.goto('/campaigns');
  await expect(page.getByRole('heading', { name: 'Minhas Campanhas' })).toBeVisible();
  await page.getByRole('link', { name: /Nova/ }).first().click();
  await expect(page).toHaveURL(/\/campaigns\/new$/);

  await page.getByLabel('Nome da campanha').fill('Campanha E2E');
  await page.getByLabel('Chave PIX').fill('e2e@pix.com');
  await page.getByLabel('Valor mensal (R$)').fill('25.00');

  const nextYear = String(new Date().getUTCFullYear() + 1);
  await page.locator('#startMonth-month').selectOption('01');
  await page.locator('#startMonth-year').selectOption(nextYear);
  await page.locator('#endMonth-month').selectOption('06');
  await page.locator('#endMonth-year').selectOption(nextYear);

  await page.getByRole('button', { name: 'Criar Campanha' }).click();
  await page.waitForURL((url) => /\/campaigns\/[a-z0-9]{10,}$/.test(url.pathname), {
    timeout: 15_000,
  });
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
