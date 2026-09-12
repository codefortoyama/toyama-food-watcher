import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Use HashRouter, so we navigate to /
  await page.goto('/');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/富山市/);
});

test('can navigate to list and search', async ({ page }) => {
  await page.click('text=探す');
  await expect(page).toHaveURL(/.*list/);

  const searchInput = page.locator('input[placeholder*="施設名"]');
  await searchInput.fill('富山');

  await expect(page.locator('text=該当件数')).toBeVisible();
});

test('can open detail page', async ({ page }) => {
  await page.click('text=探す');
  // Wait for cards to load
  await page.waitForSelector('.card');
  await page.click('text=詳細を見る');

  await expect(page).toHaveURL(/.*facilities/);
  await expect(page.locator('text=許可番号')).toBeVisible();
});

test('can add to favorites', async ({ page }) => {
  await page.click('text=探す');
  await page.click('text=詳細を見る');

  const favBtn = page.locator('button:has-text("お気に入り登録")');
  await favBtn.click();

  await expect(page.locator('text=お気に入り解除')).toBeVisible();

  await page.click('text=★');
  await expect(page.locator('.card')).toBeVisible();
});
