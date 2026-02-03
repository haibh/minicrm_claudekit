/**
 * Shared E2E test helpers for consistent Radix UI component interaction
 *
 * Includes workaround for Next.js dev server caching where freshly
 * created entities may not appear in server-rendered dropdowns on
 * the initial page load.
 */
import { Page } from '@playwright/test';

/**
 * Navigate to a URL and reload to ensure fresh server-rendered data.
 * Works around Next.js dev server caching.
 */
export async function gotoFresh(page: Page, url: string) {
  await page.goto(url);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
}

/**
 * Click a Radix Select trigger by index and pick an option by text.
 *
 * If the desired item is not found, reloads the page and retries once.
 */
export async function selectOption(page: Page, triggerIndex: number, optionText: string | RegExp) {
  // Attempt to find and select item, with one retry after reload
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      // Reload the page to get fresh server data
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(500);
    }

    const trigger = page.locator('[data-slot="select-trigger"]').nth(triggerIndex);
    await trigger.waitFor({ state: 'visible', timeout: 10000 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    // Wait for content portal to appear
    try {
      await page.locator('[data-slot="select-content"]').waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // Content didn't appear — retry
      if (attempt === 0) continue;
      throw new Error(`Select content did not appear after retry for trigger index ${triggerIndex}`);
    }

    // Check if the item exists
    const item = page.locator('[data-slot="select-item"]').filter({ hasText: optionText }).first();
    const count = await item.count();

    if (count > 0) {
      await item.scrollIntoViewIfNeeded();
      await item.waitFor({ state: 'visible', timeout: 10000 });
      await item.click();
      await page.waitForTimeout(500);
      return;
    }

    // Item not found — close dropdown before retry/fail
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  throw new Error(`Select item matching "${optionText}" not found after reload retry`);
}
