import { test, expect } from '@playwright/test';
import { resetData, seedCampaign } from './helpers/db';
import { expectNoA11yViolations } from './helpers/axe';

test.describe('D: a11y audit — páginas fora dos fluxos principais', () => {
  test.beforeEach(async () => {
    await resetData();
  });

  test('/login (não autenticado)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    try {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Gestor de Contribuições' })).toBeVisible();
      await expectNoA11yViolations(page, '/login');
    } finally {
      await ctx.close();
    }
  });

  test('/legal/privacy e /legal/terms', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoA11yViolations(page, '/legal/privacy');

    await page.goto('/legal/terms');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoA11yViolations(page, '/legal/terms');
  });

  test('/settings/account', async ({ page }) => {
    await page.goto('/settings/account');
    await expect(page.getByRole('heading', { level: 1, name: 'Configurações da conta' })).toBeVisible();
    await expectNoA11yViolations(page, '/settings/account');
  });

  test('AccessibilityPanel aberto no header', async ({ page }) => {
    const campaignId = await seedCampaign({ name: 'A11y Panel Test' });
    await page.goto(`/campaigns/${campaignId}`);

    const panelTrigger = page
      .getByRole('banner')
      .getByRole('button', { name: /acessibilidade/i });
    await panelTrigger.click();
    await expect(page.getByText('Tamanho da fonte')).toBeVisible();
    await expectNoA11yViolations(page, 'AccessibilityPanel (open)');
  });
});
