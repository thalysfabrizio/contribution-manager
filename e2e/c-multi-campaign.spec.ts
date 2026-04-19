import { test, expect } from '@playwright/test';
import { resetData, seedCampaign } from './helpers/db';

test.beforeEach(async () => {
  await resetData();
});

test('C: two campaigns → header selector navigates between them', async ({ page }) => {
  const firstId = await seedCampaign({ name: 'Campanha Alpha' });
  const secondId = await seedCampaign({ name: 'Campanha Beta' });

  await page.goto(`/campaigns/${firstId}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Campanha Alpha' })).toBeVisible();

  await page.getByRole('button', { name: 'Selecionar' }).click();

  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Campanha Alpha' })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Campanha Beta' })).toBeVisible();

  await menu.getByRole('menuitem', { name: 'Campanha Beta' }).click();
  await page.waitForURL(`**/campaigns/${secondId}`);

  await expect(page.getByRole('heading', { level: 1, name: 'Campanha Beta' })).toBeVisible();
});
