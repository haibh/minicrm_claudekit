/**
 * E2E Tests: Company CRUD Operations
 * Tests creating, reading, updating, deleting, searching, and filtering companies
 */
import { test, expect } from "./auth-fixture";
import { gotoFresh } from "./radix-select-interaction-helpers";

test.describe("Company CRUD Operations", () => {
  test("TC-CO01: Company list page renders", async ({ authenticatedPage: page }) => {
    await page.goto("/companies");

    await expect(page.getByRole("heading", { name: /companies/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /new company/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search companies/i)).toBeVisible();
  });

  test("TC-CO02: Create new company", async ({ authenticatedPage: page }) => {
    await page.goto("/companies/new");

    const timestamp = Date.now();
    const companyName = `Test Company ${timestamp}`;

    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByLabel(/industry/i).fill("Technology");
    await page.getByLabel(/website/i).fill("https://example.com");
    await page.getByLabel(/phone/i).fill("+1 555 123 4567");
    await page.getByLabel(/email/i).fill("contact@testcompany.com");

    await page.getByRole("button", { name: /save company/i }).click();

    // Should redirect to company list or detail page
    await expect(page).toHaveURL(/\/companies/);
    await expect(page.getByText(companyName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-CO03: Create company with tags", async ({ authenticatedPage: page }) => {
    await page.goto("/companies/new");

    const timestamp = Date.now();
    const companyName = `Tagged Company ${timestamp}`;

    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByLabel(/tags/i).fill("client, premium, tech");

    await page.getByRole("button", { name: /save company/i }).click();

    await expect(page).toHaveURL(/\/companies/);
    await expect(page.getByText(companyName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-CO04: View company detail", async ({ authenticatedPage: page }) => {
    // First create a company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Detail Test ${timestamp}`;

    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByLabel(/industry/i).fill("Finance");
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Now find and click on it
    await page.getByText(companyName).first().click();

    // Should show company detail page
    await expect(page.getByRole("heading", { name: companyName }).first()).toBeVisible();
    await expect(page.getByText(/Finance/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
  });

  test("TC-CO05: Edit company name", async ({ authenticatedPage: page }) => {
    // Create a company first
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const originalName = `Edit Test ${timestamp}`;

    await page.getByLabel(/company name/i).fill(originalName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Click on company to view detail
    await page.getByText(originalName).first().click();

    // Click edit button
    await page.getByRole("button", { name: /edit/i }).click();

    // Should be on edit page
    await expect(page).toHaveURL(/\/companies\/.*\/edit/);

    const updatedName = `${originalName} Updated`;
    await page.getByLabel(/company name/i).fill(updatedName);
    await page.getByRole("button", { name: /save company/i }).click();

    // Should show updated name
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
  });

  test("TC-CO06: Delete company", async ({ authenticatedPage: page }) => {
    // Create a company to delete
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Delete Test ${timestamp}`;

    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Click on company
    await page.getByText(companyName).first().click();

    // Click delete button
    await page.getByRole("button", { name: /delete/i }).click();

    // Should show confirmation dialog
    await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole("button", { name: /delete|confirm/i }).last().click();

    // Should redirect to company list and company should be gone
    await expect(page).toHaveURL(/\/companies$/);
    await expect(page.getByText(companyName)).not.toBeVisible({ timeout: 10000 });
  });

  test("TC-CO07: Search companies", async ({ authenticatedPage: page }) => {
    // Create a uniquely named company
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const uniqueName = `SearchTest${timestamp}`;

    await page.getByLabel(/company name/i).fill(uniqueName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/, { timeout: 10000 });

    // Go to companies list page (reload to bust Next.js cache)
    await gotoFresh(page, '/companies');

    // Search for the company
    const searchInput = page.getByPlaceholder(/search companies/i);
    await searchInput.fill(uniqueName);
    await searchInput.press("Enter");

    // Wait for search to complete (debounced + network)
    await page.waitForTimeout(2000);

    // Should show filtered results
    await expect(page.getByText(uniqueName).first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-CO08: Filter by size (if filter exists)", async ({ authenticatedPage: page }) => {
    await page.goto("/companies");

    // Check if size filter exists
    const sizeFilter = page.locator('select[name="size"], [aria-label*="size" i]');
    const filterExists = await sizeFilter.count() > 0;

    if (filterExists) {
      await sizeFilter.first().selectOption({ index: 1 }); // Select first non-empty option
      await page.waitForTimeout(1000); // Wait for results to update
      // Verify page reloaded with filter in URL
      await expect(page).toHaveURL(/size=/);
    }
  });

  test.skip("TC-CO09: Pagination (if enough data)", async ({ authenticatedPage: page }) => {
    // Skipped: Database is cleaned before tests, so there won't be enough companies for pagination
    await page.goto("/companies");

    // Check if pagination exists
    const nextButton = page.getByRole("button", { name: /next/i });
    const paginationExists = await nextButton.count() > 0;

    if (paginationExists) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test("TC-CO10: Empty name validation", async ({ authenticatedPage: page }) => {
    await page.goto("/companies/new");

    // Try to submit without name
    await page.getByLabel(/industry/i).fill("Technology");
    await page.getByRole("button", { name: /save company/i }).click();

    // Should show validation error or not submit
    // HTML5 validation should prevent submission
    const nameInput = page.getByLabel(/company name/i);
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});
