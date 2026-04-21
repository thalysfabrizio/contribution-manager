import { test, expect } from '@playwright/test';
import { resetData } from './helpers/db';
import { expectNoA11yViolations } from './helpers/axe';

test.beforeEach(async () => {
  await resetData();
});

test('A: create campaign → add participant → mark paid → export PDF', async ({ page }) => {
  await page.goto('/campaigns');
  await expect(page.getByRole('heading', { name: 'Minhas Campanhas' })).toBeVisible();
  await expectNoA11yViolations(page, 'campaigns (empty list)');

  await page.getByRole('link', { name: /Nova/ }).first().click();
  await expect(page).toHaveURL(/\/campaigns\/new$/);
  await expectNoA11yViolations(page, 'campaigns/new (form)');

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
  await expectNoA11yViolations(page, 'campaign dashboard (empty)');

  await page.getByRole('button', { name: /Novo Participante/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoA11yViolations(page, 'AddParticipantModal (open)');
  await page.getByLabel('Telefone').fill('83999111222');
  await page.getByLabel('Nome', { exact: true }).fill('Zé Participante');
  await page.getByRole('button', { name: 'Adicionar' }).click();

  const row = page.getByRole('row').filter({ hasText: 'Zé Participante' });
  await expect(row).toBeVisible({ timeout: 10_000 });

  await row.getByRole('button', { name: 'Pendente' }).first().click();
  await page.getByRole('menuitem', { name: 'PIX', exact: true }).click();
  await expect(row.getByRole('button', { name: /PIX/ }).first()).toBeVisible();

  // Export PDF agora é inline (window.print() chamado pelo botão "Exportar PDF").
  // Em vez de tentar capturar o print dialog (não-funcional em headless), valida
  // que o botão existe e que o print-report está renderizado no DOM com os dados.
  await expect(page.getByRole('button', { name: /Imprimir ou salvar relatório/ })).toBeVisible();
  const printReport = page.locator('.print-report');
  await expect(printReport).toContainText('Zé Participante');
  await expect(printReport).toContainText('Campanha E2E');
});
