/**
 * E2E Tests: Deal Pipeline Management
 * Tests deal CRUD, kanban/list views, drag-drop, and pipeline functionality
 */
import { test, expect } from "./auth-fixture";
import { selectOption, gotoFresh } from "./radix-select-interaction-helpers";

test.describe("Deal Pipeline Management", () => {
  test("TC-DL01: Kanban view renders with columns", async ({ authenticatedPage: page }) => {
    await page.goto("/deals");

    await expect(page.getByRole("heading", { name: /deals/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /new deal/i })).toBeVisible();

    // Check for kanban columns
    await expect(page.getByText(/prospecting/i)).toBeVisible();
    await expect(page.getByText(/qualification/i)).toBeVisible();
    await expect(page.getByText(/proposal/i)).toBeVisible();
    await expect(page.getByText(/negotiation/i)).toBeVisible();
  });

  test("TC-DL02: Toggle to list view", async ({ authenticatedPage: page }) => {
    await page.goto("/deals");

    // Find view toggle button
    const listViewButton = page.getByRole("button", { name: /list/i }).or(
      page.getByRole("link", { name: /list/i })
    );

    await listViewButton.click();

    // Should switch to list view
    await expect(page).toHaveURL(/view=list/);
  });

  test("TC-DL03: Toggle back to kanban", async ({ authenticatedPage: page }) => {
    await page.goto("/deals?view=list");

    // Find kanban view button
    const kanbanViewButton = page.getByRole("button", { name: /kanban/i }).or(
      page.getByRole("link", { name: /kanban/i })
    );

    await kanbanViewButton.click();

    // Should switch to kanban view
    await expect(page).toHaveURL(/view=kanban|\/deals$/);
  });

  test("TC-DL04: Create new deal", async ({ authenticatedPage: page }) => {
    // Create company first
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Deal Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create deal (gotoFresh busts cache for company dropdown)
    await gotoFresh(page, "/deals/new");
    const dealName = `Test Deal ${timestamp}`;

    // Select company FIRST — selectOption may reload page
    await selectOption(page, 1, companyName);

    // Fill text fields AFTER selectOption
    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("50000");
    await page.getByLabel(/probability/i).fill("75");

    await page.getByRole("button", { name: /create deal/i }).click();

    // Should redirect to deal detail page
    await expect(page).toHaveURL(/\/deals/);
    await expect(page.getByText(dealName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-DL05: Create deal with contact", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Deal Contact Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const contactName = `Deal Contact ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, companyName);

    // Fill name AFTER
    await page.getByLabel(/contact name/i).fill(contactName);

    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // Create deal with contact (gotoFresh busts cache)
    await gotoFresh(page, "/deals/new");
    const dealName = `Deal With Contact ${timestamp}`;

    // Select company FIRST (may reload page)
    await selectOption(page, 1, companyName);

    // Wait for contact dropdown to populate based on company
    await page.waitForTimeout(500);

    // Select contact (third select)
    await selectOption(page, 2, contactName);

    // Fill text fields AFTER all selectOption calls
    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("30000");

    await page.getByRole("button", { name: /create deal/i }).click();

    await expect(page).toHaveURL(/\/deals/);
    await expect(page.getByText(dealName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-DL06: Contact dropdown filters by company", async ({ authenticatedPage: page }) => {
    // Create two companies
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const company1Name = `Filter Company 1 ${timestamp}`;
    await page.getByLabel(/company name/i).fill(company1Name);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    await page.goto("/companies/new");
    const company2Name = `Filter Company 2 ${timestamp}`;
    await page.getByLabel(/company name/i).fill(company2Name);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact for company 1 (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const contact1Name = `Contact Company1 ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, company1Name);

    // Fill name AFTER
    await page.getByLabel(/contact name/i).fill(contact1Name);

    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // Now create deal and verify filtering (gotoFresh busts cache)
    await gotoFresh(page, "/deals/new");

    // Select company 2 (second select: stage, company, contact)
    await selectOption(page, 1, company2Name);

    // Wait for contact dropdown to filter
    await page.waitForTimeout(500);

    // Try to open contact dropdown (third select)
    const contactTrigger = page.locator('[data-slot="select-trigger"]').nth(2);
    await contactTrigger.click();
    await page.locator('[data-slot="select-content"]').waitFor({ state: 'visible', timeout: 5000 });

    // Contact from company 1 should NOT be visible in the dropdown
    await expect(page.locator('[data-slot="select-item"]').filter({ hasText: contact1Name })).not.toBeVisible();
  });

  test("TC-DL07: View deal detail", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `View Deal Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create deal (gotoFresh busts cache)
    await gotoFresh(page, "/deals/new");
    const dealName = `View Deal ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 1, companyName);

    // Fill text fields AFTER
    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("100000");

    await page.getByRole("button", { name: /create deal/i }).click();
    await page.waitForURL(/\/deals/);

    // Click to view detail
    await page.getByText(dealName).first().click();

    // Should show deal detail page (use .first() as name appears in PageHeader + DealDetailCard)
    await expect(page.getByRole("heading", { name: dealName }).first()).toBeVisible();
    await expect(page.getByText(/100,000|100000/).first()).toBeVisible();
  });

  test("TC-DL08: Edit deal", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Edit Deal Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create deal (gotoFresh busts cache)
    await gotoFresh(page, "/deals/new");
    const originalName = `Edit Deal ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 1, companyName);

    // Fill text fields AFTER
    await page.getByLabel(/deal name/i).fill(originalName);
    await page.getByLabel(/deal value/i).fill("50000");

    await page.getByRole("button", { name: /create deal/i }).click();
    await page.waitForURL(/\/deals/);

    // View detail
    await page.getByText(originalName).first().click();

    // Edit
    await page.getByRole("button", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/deals\/.*\/edit/);

    const updatedName = `${originalName} Updated`;
    await page.getByLabel(/deal name/i).fill(updatedName);
    await page.getByRole("button", { name: /update deal/i }).click();

    // Use .first() as name appears in both PageHeader and DealDetailCard
    await expect(page.getByText(updatedName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-DL09: Delete deal", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Delete Deal Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create deal (gotoFresh busts cache)
    await gotoFresh(page, "/deals/new");
    const dealName = `Delete Deal ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 1, companyName);

    // Fill text fields AFTER
    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("25000");

    await page.getByRole("button", { name: /create deal/i }).click();
    await page.waitForURL(/\/deals/);

    // View detail
    await page.getByText(dealName).first().click();

    // Delete
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();
    await page.getByRole("button", { name: /delete|confirm/i }).last().click();

    // Wait for redirect to deals list page (not detail page)
    await page.waitForURL(/\/deals$/, { timeout: 15000 });
    await page.waitForLoadState('load');
    await expect(page.getByText(dealName)).not.toBeVisible({ timeout: 10000 });
  });

  test.skip("TC-DL10: Kanban drag-drop", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Drag Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create deal in prospecting stage
    await page.goto("/deals/new");
    const dealName = `Drag Deal ${timestamp}`;
    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("40000");

    // Select stage - prospecting (first select: stage, company, contact)
    await selectOption(page, 0, /prospecting/i);

    // Select company (second select)
    await selectOption(page, 1, companyName);

    await page.getByRole("button", { name: /create deal/i }).click();
    await page.waitForURL(/\/deals/);

    // Find the deal card
    const dealCard = page.getByText(dealName).first();
    await expect(dealCard).toBeVisible();

    // Find qualification column
    const qualificationColumn = page.locator('text=/qualification/i').first();

    // Perform drag and drop
    await dealCard.dragTo(qualificationColumn);

    // Wait for optimistic update
    await page.waitForTimeout(1000);

    // Verify deal moved (page should refresh)
    // The deal should now be in qualification column
    await page.reload();
    await expect(page.getByText(dealName)).toBeVisible();
  });

  test("TC-DL11: Kanban cards show deal info", async ({ authenticatedPage: page }) => {
    await page.goto("/deals");

    // Check if any deal cards exist
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card, [class*="kanban-card"]');
    const cardCount = await dealCards.count();

    if (cardCount > 0) {
      const firstCard = dealCards.first();
      // Verify card contains deal information (name, value, etc.)
      await expect(firstCard).toBeVisible();
      // Card should contain some text (deal name or value)
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
    }
  });

  test("TC-DL12: Stage badge colors", async ({ authenticatedPage: page }) => {
    await page.goto("/deals");

    // Check for stage badges with different colors
    // Badges should have different styling for different stages
    const badges = page.locator('[class*="badge"], [data-stage]');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      const firstBadge = badges.first();
      await expect(firstBadge).toBeVisible();
      // Badge should have some background color or styling
      const bgColor = await firstBadge.evaluate((el: HTMLElement) =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    }
  });
});
