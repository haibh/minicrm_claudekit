/**
 * Playwright auth fixture — reusable login state for all E2E tests.
 * Tests extend this to get an already-authenticated browser context.
 */
import { test as base, expect, Page } from "@playwright/test";

// Test user credentials (must exist in DB — created by seed or test setup)
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";
const TEST_NAME = "Test User";

// Flag to track if we've tried to create the user
let userCreationAttempted = false;

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
    // Create test user if not already attempted
    if (!userCreationAttempted) {
      userCreationAttempted = true;
      try {
        const response = await page.request.post("/api/auth/sign-up/email", {
          data: {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            name: TEST_NAME,
          },
        });

        if (response.ok()) {
          console.log("✅ Test user created successfully");
        } else {
          const body = await response.json().catch(() => ({}));
          // User already exists is fine
          if (body?.error?.message?.toLowerCase().includes("exist")) {
            console.log("✅ Test user already exists");
          }
        }
      } catch (error) {
        console.warn("⚠️ Could not create test user, assuming it exists:", error);
      }
    }

    // Navigate to login page and perform login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill in credentials
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);

    // Click login button
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for client-side auth to complete and redirect
    await page.waitForTimeout(3000);

    // Try to navigate to dashboard (root uses (dashboard) layout with sidebar + header)
    await page.goto("/");
    await page.waitForLoadState("load", { timeout: 15000 });

    // If we're still on login page, auth failed
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Authentication failed - still on login page');
    }

    await use(page);
  },
});

export { expect };
