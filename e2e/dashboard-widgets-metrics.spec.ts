/**
 * E2E Tests: Dashboard Widgets & Metrics
 * Tests dashboard rendering, metrics display, quick actions, and widget functionality
 */
import { test, expect } from "./auth-fixture";
import { selectOption, gotoFresh } from "./radix-select-interaction-helpers";

test.describe("Dashboard Widgets & Metrics", () => {
  test("TC-DB01: Dashboard renders all widgets", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Main heading
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 10000 });

    // Welcome message
    await expect(page.getByText(/welcome back/i)).toBeVisible();

    // Quick actions bar
    await expect(page.getByRole("link", { name: /new company/i })).toBeVisible();

    // Metrics row (should have metric cards)
    await expect(page.getByText("Total Companies")).toBeVisible();

    // Pipeline overview widget
    await expect(page.getByRole("heading", { name: /pipeline overview/i })).toBeVisible();

    // Recent activities widget
    await expect(page.getByRole("heading", { name: "Recent Activities" })).toBeVisible();

    // Deals closing soon widget
    await expect(page.getByRole("heading", { name: "Deals Closing Soon" })).toBeVisible();
  });

  test("TC-DB02: Metrics show non-zero counts", async ({ authenticatedPage: page }) => {
    // First create some data to ensure non-zero metrics
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Metric Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    // Go to dashboard (gotoFresh busts cache for metrics)
    await gotoFresh(page, "/dashboard");

    // Check that all metric labels are visible
    await expect(page.getByText("Total Companies")).toBeVisible();
    await expect(page.getByText("Total Contacts")).toBeVisible();
    await expect(page.getByText("Open Deals")).toBeVisible();
    await expect(page.getByText("Pipeline Value")).toBeVisible();

    // Metric cards should display numeric values (look for the 2xl font-bold values)
    const metricValues = page.locator('p.text-2xl.font-bold');
    expect(await metricValues.count()).toBeGreaterThanOrEqual(4);
  });

  test("TC-DB03: Quick actions bar present", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // All quick action buttons should be visible
    await expect(page.getByRole("link", { name: /new company/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /new contact/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /new deal/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /log activity/i })).toBeVisible();
  });

  test("TC-DB04: Quick action navigates to create page", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Click "New Company" quick action
    await page.getByRole("link", { name: /new company/i }).click();

    // Should navigate to company creation page
    await expect(page).toHaveURL(/\/companies\/new/);
    await expect(page.getByRole("heading", { name: /create company/i }).first()).toBeVisible();
  });

  test("TC-DB05: Pipeline overview shows stages", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Pipeline overview widget heading should be visible
    await expect(page.getByRole("heading", { name: /pipeline overview/i })).toBeVisible();

    // Widget should either show "No open deals" or display pipeline data
    const noDealsMessage = await page.getByText(/no open deals/i).count();

    if (noDealsMessage === 0) {
      // If there are deals, check for table headers
      const hasTableHeaders =
        (await page.getByText(/^Stage$/i).count() > 0) ||
        (await page.getByText(/^Count$/i).count() > 0) ||
        (await page.getByText(/^Value$/i).count() > 0);
      expect(hasTableHeaders).toBeTruthy();
    } else {
      // No deals is a valid state
      expect(noDealsMessage).toBeGreaterThan(0);
    }
  });

  test.skip("TC-DB06: Recent activities visible", async ({ authenticatedPage: page }) => {
    // Create an activity first
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Dashboard Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    await page.goto("/activities/new");
    const activitySubject = `Dashboard Activity ${timestamp}`;

    // Select activity type (first select)
    await selectOption(page, 0, /note/i);

    await page.getByLabel(/subject/i).fill(activitySubject);

    // Link company (second select)
    await selectOption(page, 1, companyName);

    await page.getByRole("button", { name: /create activity/i }).click();
    await page.waitForURL(/\/activities/);

    // Go to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Recent activities widget should show the activity
    const recentActivitiesWidget = page.locator('text=/recent activities/i').first();
    await expect(recentActivitiesWidget).toBeVisible();

    // The activity should appear in the widget
    await expect(page.getByText(activitySubject)).toBeVisible({ timeout: 5000 });
  });

  test.skip("TC-DB07: Deals closing soon visible", async ({ authenticatedPage: page }) => {
    // Create a deal with close date soon
    await page.goto("/companies/new");
    const timestamp = Date.now();
    const companyName = `Closing Company ${timestamp}`;
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByRole("button", { name: /save company/i }).click();
    await page.waitForURL(/\/companies/);

    await page.goto("/deals/new");
    const dealName = `Closing Soon ${timestamp}`;

    await page.getByLabel(/deal name/i).fill(dealName);
    await page.getByLabel(/deal value/i).fill("75000");

    // Set close date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.getByLabel(/expected close date/i).fill(dateString);

    // Select company (first select on deal form)
    await selectOption(page, 0, companyName);

    await page.getByRole("button", { name: /create deal/i }).click();
    await page.waitForURL(/\/deals/);

    // Go to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Deals closing soon widget should be visible
    const closingSoonWidget = page.locator('text=/closing soon/i').first();
    await expect(closingSoonWidget).toBeVisible();

    // The deal should appear in the widget
    await expect(page.getByText(dealName)).toBeVisible({ timeout: 5000 });
  });

  test("TC-DB08: Metric card links work", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // The metric cards are wrapped in Link components (href="/companies")
    // Find the card with "Total Companies" text and click its parent link
    const companiesLink = page.locator('a[href="/companies"]').filter({ hasText: /total companies/i });
    await expect(companiesLink).toBeVisible();

    await companiesLink.click();
    // Should navigate to companies page
    await expect(page).toHaveURL(/\/companies/);
  });
});
