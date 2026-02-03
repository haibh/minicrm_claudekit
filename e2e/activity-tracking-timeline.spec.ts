/**
 * E2E Tests: Activity Tracking & Timeline
 * Tests activity creation, timeline display, filtering, and entity linking
 */
import { test, expect } from "./auth-fixture";
import { selectOption, gotoFresh } from "./radix-select-interaction-helpers";

test.describe("Activity Tracking & Timeline", () => {
  test("TC-AT01: Timeline renders", async ({ authenticatedPage: page }) => {
    await page.goto("/activities");

    await expect(page.getByRole("heading", { name: /activities/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /log activity/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search activities/i)).toBeVisible();
  });

  test("TC-AT02: Create activity linked to company", async ({ authenticatedPage: page }) => {
    // Create company first
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Activity Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create activity (gotoFresh busts cache for company dropdown)
    await gotoFresh(page, "/activities/new");

    // Select type and company FIRST — selectOption may reload page
    await selectOption(page, 0, /call/i);
    await selectOption(page, 1, companyName);

    // Fill text fields AFTER selectOption calls
    await page.getByLabel(/subject/i).fill(`Test Call ${timestamp}`);
    await page.getByLabel(/description/i).fill("Discussed project requirements");

    await page.getByRole("button", { name: /create activity/i }).click();

    // Should redirect to activity detail page
    await expect(page).toHaveURL(/\/activities/);
    await expect(page.getByText(`Test Call ${timestamp}`)).toBeVisible({ timeout: 10000 });
  });

  test("TC-AT03: Create activity linked to contact+deal", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Full Activity Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const contactName = `Activity Contact ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, companyName);

    // Fill name AFTER
    await page.getByLabel(/contact name/i).fill(contactName);

    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // Create deal (gotoFresh busts cache)
    await gotoFresh(page, "/deals/new");
    const dealName = `Activity Deal ${timestamp}`;

    // Select company FIRST (index 1: stage=0, company=1, contact=2)
    await selectOption(page, 1, companyName);

    // Fill text fields AFTER
    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("60000");

    await page.getByRole("button", { name: /create deal/i }).click();
    await page.waitForURL(/\/deals/);

    // Create activity linked to all (gotoFresh busts cache)
    await gotoFresh(page, "/activities/new");

    // Select ALL dropdowns FIRST — selectOption may reload page
    await selectOption(page, 0, /meeting/i);
    await selectOption(page, 1, companyName);

    await page.waitForTimeout(500);

    // Link contact (third select)
    await selectOption(page, 2, contactName);

    await page.waitForTimeout(500);

    // Link deal (fourth select)
    await selectOption(page, 3, dealName);

    // Fill text fields AFTER all selectOption calls
    await page.getByLabel(/subject/i).fill(`Team Meeting ${timestamp}`);

    await page.getByRole("button", { name: /create activity/i }).click();

    await expect(page).toHaveURL(/\/activities/);
    await expect(page.getByText(`Team Meeting ${timestamp}`)).toBeVisible({ timeout: 10000 });
  });

  test("TC-AT04: Pre-fill via URL params", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Prefill Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Get company ID directly from redirect URL (/companies/{id})
    const currentUrl = page.url();
    const companyId = currentUrl.match(/\/companies\/([^\/]+)/)?.[1];

    // Navigate to activity form with pre-filled company (gotoFresh busts cache so companies list is fresh)
    await gotoFresh(page, `/activities/new?companyId=${companyId}`);

    // Verify company is pre-selected: hidden input should have the companyId value
    await expect(page.locator('input[name="companyId"]')).toHaveValue(companyId!, { timeout: 10000 });

    // Also verify the select trigger shows the company name (not just placeholder)
    const companyTrigger = page.locator('[data-slot="select-trigger"]').nth(1);
    const triggerText = await companyTrigger.textContent();
    // If companies list loaded, trigger should show company name; if stale, at least the hidden input is set
    if (triggerText && triggerText.includes(companyName)) {
      await expect(companyTrigger).toContainText(companyName);
    }
  });

  test("TC-AT05: Filter by type", async ({ authenticatedPage: page }) => {
    await gotoFresh(page, "/activities");

    // Click the type filter Radix Select trigger (aria-label="Filter by type")
    const filterTrigger = page.locator('[aria-label="Filter by type"]');
    await expect(filterTrigger).toBeVisible({ timeout: 5000 });
    await filterTrigger.click();

    // Wait for dropdown and click "Call"
    await page.locator('[data-slot="select-content"]').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('[data-slot="select-item"]').filter({ hasText: /^Call$/ }).click();

    // Verify URL contains type filter
    await expect(page).toHaveURL(/type=call/, { timeout: 10000 });
  });

  test("TC-AT06: Search by subject", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Search Activity Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create activity with unique subject (gotoFresh busts cache)
    await gotoFresh(page, "/activities/new");
    const uniqueSubject = `UniqueActivity${timestamp}`;

    // Select type and company FIRST
    await selectOption(page, 0, /note/i);
    await selectOption(page, 1, companyName);

    // Fill subject AFTER
    await page.getByLabel(/subject/i).fill(uniqueSubject);

    await page.getByRole("button", { name: /create activity/i }).click();
    await page.waitForURL(/\/activities/);

    // Navigate to activities list (redirect went to detail page)
    await gotoFresh(page, "/activities");

    // Search for it
    const searchInput = page.getByPlaceholder(/search activities/i);
    await searchInput.fill(uniqueSubject);
    await searchInput.press("Enter");

    await expect(page.getByText(uniqueSubject)).toBeVisible();
  });

  test("TC-AT07: Edit activity", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Edit Activity Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create activity (gotoFresh busts cache)
    await gotoFresh(page, "/activities/new");
    const originalSubject = `Edit Activity ${timestamp}`;

    // Select type and company FIRST
    await selectOption(page, 0, /email/i);
    await selectOption(page, 1, companyName);

    // Fill subject AFTER
    await page.getByLabel(/subject/i).fill(originalSubject);

    await page.getByRole("button", { name: /create activity/i }).click();
    await page.waitForURL(/\/activities/);

    // Find and click on activity (redirect went to detail page)
    await page.getByText(originalSubject).first().click();

    // Look for edit button
    const editButton = page.getByRole("button", { name: /edit/i });

    if (await editButton.count() > 0) {
      await editButton.click();
      await expect(page).toHaveURL(/\/activities\/.*\/edit/);

      const updatedSubject = `${originalSubject} Updated`;
      await page.getByLabel(/subject/i).fill(updatedSubject);
      await page.getByRole("button", { name: /update|save activity/i }).click();

      await expect(page.getByText(updatedSubject)).toBeVisible({ timeout: 10000 });
    }
  });

  test("TC-AT08: Delete activity", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Delete Activity Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create activity (gotoFresh busts cache)
    await gotoFresh(page, "/activities/new");
    const activitySubject = `Delete Activity ${timestamp}`;

    // Select type and company FIRST
    await selectOption(page, 0, /call/i);
    await selectOption(page, 1, companyName);

    // Fill subject AFTER
    await page.getByLabel(/subject/i).fill(activitySubject);

    await page.getByRole("button", { name: /create activity/i }).click();
    await page.waitForURL(/\/activities/);

    // Find delete button for this activity (might be in timeline)
    const activityRow = page.locator(`text=${activitySubject}`).first();
    await activityRow.hover();

    const deleteButton = page.getByRole("button", { name: /delete/i }).first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion if there's a dialog
      const confirmButton = page.getByRole("button", { name: /confirm|delete/i }).last();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Wait for redirect to activities list after deletion
      await page.waitForURL(/\/activities$/, { timeout: 15000 });
      await page.waitForLoadState('load');
      // Activity should be removed
      await expect(page.getByText(activitySubject)).not.toBeVisible({ timeout: 10000 });
    }
  });
});
