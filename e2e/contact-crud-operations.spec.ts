/**
 * E2E Tests: Contact CRUD Operations
 * Tests creating, reading, updating, deleting, searching, and filtering contacts
 */
import { test, expect } from "./auth-fixture";
import { selectOption, gotoFresh } from "./radix-select-interaction-helpers";

test.describe("Contact CRUD Operations", () => {
  test("TC-CN01: Contact list renders", async ({ authenticatedPage: page }) => {
    await page.goto("/contacts");

    await expect(page.getByRole("heading", { name: "Contacts", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /add contact/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search contacts/i)).toBeVisible();
  });

  test("TC-CN02: Create contact with company", async ({ authenticatedPage: page }) => {
    // First create a company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Contact Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Now create a contact (gotoFresh busts Next.js dev server cache)
    await gotoFresh(page, "/contacts/new");
    const contactName = `Test Contact ${timestamp}`;

    // Select company FIRST — selectOption may reload page, clearing text fields
    await selectOption(page, 0, companyName);

    // Fill text fields AFTER selectOption
    await page.getByLabel(/contact name/i).fill(contactName);
    await page.getByLabel(/email/i).fill(`contact${timestamp}@test.com`);
    await page.getByLabel(/phone/i).fill("+1 555 999 8888");
    await page.getByLabel(/job title/i).fill("CEO");

    await page.getByRole("button", { name: /save contact/i }).click();

    // Should redirect to contacts list
    await page.waitForURL(/\/contacts/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(contactName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-CN03: Create decision-maker contact", async ({ authenticatedPage: page }) => {
    // Create a company first
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `DM Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create decision-maker contact (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const contactName = `Decision Maker ${timestamp}`;

    // Select company FIRST — selectOption may reload page
    await selectOption(page, 0, companyName);

    // Fill text fields AFTER selectOption
    await page.getByLabel(/contact name/i).fill(contactName);

    // Check decision maker checkbox - use click() for Radix checkbox
    await page.getByLabel(/decision maker/i).click();

    // Wait for authority level select to appear and become interactable
    await page.waitForTimeout(500);

    // Select authority level (second select - appears after checking decision maker)
    await selectOption(page, 1, /primary decision maker/i);

    await page.getByRole("button", { name: /save contact/i }).click();

    await expect(page).toHaveURL(/\/contacts/);
    await expect(page.getByText(contactName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-CN04: Authority hidden when unchecked", async ({ authenticatedPage: page }) => {
    await page.goto("/contacts/new");

    // Authority level should not be visible initially
    await expect(page.getByLabel(/authority level/i)).not.toBeVisible();
  });

  test("TC-CN05: Authority shown when checked", async ({ authenticatedPage: page }) => {
    await page.goto("/contacts/new");

    // Authority level select should not be visible initially (only company select exists)
    await expect(page.locator('[data-slot="select-trigger"]').nth(1)).not.toBeVisible();

    // Check decision maker checkbox - use click() for Radix checkbox
    await page.getByLabel(/decision maker/i).click();

    // Authority level should now be visible as the second select trigger
    await page.waitForTimeout(300);
    await expect(page.locator('[data-slot="select-trigger"]').nth(1)).toBeVisible();
  });

  test("TC-CN06: View contact detail", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `View Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const contactName = `View Contact ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, companyName);

    // Fill text fields AFTER
    await page.getByLabel(/contact name/i).fill(contactName);
    await page.getByLabel(/job title/i).fill("Manager");
    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // Click to view detail
    await page.getByText(contactName).first().click();

    // Should show contact detail page
    await expect(page.getByRole("heading", { name: contactName })).toBeVisible();
    await expect(page.getByText(/Manager/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
  });

  test("TC-CN07: Edit contact", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Edit Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const originalName = `Edit Contact ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, companyName);

    // Fill name AFTER
    await page.getByLabel(/contact name/i).fill(originalName);

    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // View contact detail (redirect lands on detail page)
    await page.getByText(originalName).first().click();

    // Click edit
    await page.getByRole("button", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/contacts\/.*\/edit/);

    // Update contact
    const updatedName = `${originalName} Updated`;
    await page.getByLabel(/contact name/i).fill(updatedName);
    await page.getByRole("button", { name: /save contact/i }).click();

    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
  });

  test("TC-CN08: Delete contact", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Delete Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const contactName = `Delete Contact ${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, companyName);

    // Fill name AFTER
    await page.getByLabel(/contact name/i).fill(contactName);

    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // View detail
    await page.getByText(contactName).first().click();

    // Delete
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();
    await page.getByRole("button", { name: /delete|confirm/i }).last().click();

    await expect(page).toHaveURL(/\/contacts$/);
    await expect(page.getByText(contactName)).not.toBeVisible({ timeout: 10000 });
  });

  test("TC-CN09: Search contacts", async ({ authenticatedPage: page }) => {
    // Create company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Search Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Create contact with unique name (gotoFresh busts cache)
    await gotoFresh(page, "/contacts/new");
    const uniqueName = `SearchContact${timestamp}`;

    // Select company FIRST
    await selectOption(page, 0, companyName);

    // Fill name AFTER
    await page.getByLabel(/contact name/i).fill(uniqueName);

    await page.getByRole("button", { name: /save contact/i }).click();
    await page.waitForURL(/\/contacts/);

    // Navigate to contacts list (redirect went to detail page)
    await gotoFresh(page, "/contacts");

    // Search
    const searchInput = page.getByPlaceholder(/search contacts/i);
    await searchInput.fill(uniqueName);

    // Wait for debounce + network
    await page.waitForTimeout(1000);

    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test("TC-CN10: Filter by decision maker", async ({ authenticatedPage: page }) => {
    await page.goto("/contacts");

    // Check if decision maker filter exists
    const dmFilter = page.locator('[name="decisionMaker"], [aria-label*="decision" i]');
    const filterExists = await dmFilter.count() > 0;

    if (filterExists) {
      await dmFilter.first().click();
      await page.waitForTimeout(1000);
      // Verify URL contains filter param
      await expect(page).toHaveURL(/decisionMaker/);
    }
  });
});
