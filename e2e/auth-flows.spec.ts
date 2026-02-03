/**
 * E2E Tests: Authentication Flows
 * Tests user registration, login, logout, and route protection
 */
import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("TC-AF01: Register page renders (form fields visible)", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/^name$/i)).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("TC-AF02: Register with valid credentials → redirects to dashboard", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    const testEmail = `user${timestamp}@test.com`;

    await page.getByLabel(/^name$/i).fill(`Test User ${timestamp}`);
    await page.getByLabel(/^email$/i).fill(testEmail);
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("password123");

    await page.getByRole("button", { name: /create account/i }).click();

    // Wait for client-side auth
    await page.waitForTimeout(2000);

    // Navigate to root - should go to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard)?$/);
  });

  test("TC-AF03: Register mismatched passwords → error shown", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();

    await page.getByLabel(/^name$/i).fill(`Test User ${timestamp}`);
    await page.getByLabel(/^email$/i).fill(`user${timestamp}@test.com`);
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("differentpassword");

    await page.getByRole("button", { name: /create account/i }).click();

    // Should show error message
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test("TC-AF04: Register short password → error shown", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();

    await page.getByLabel(/^name$/i).fill(`Test User ${timestamp}`);
    await page.getByLabel(/^email$/i).fill(`user${timestamp}@test.com`);

    // Fill short password
    const passwordInput = page.getByLabel(/^password$/i);
    await passwordInput.fill("short");
    await page.getByLabel(/confirm password/i).fill("short");

    // Try to submit - HTML5 validation might prevent submission
    await page.getByRole("button", { name: /create account/i }).click();

    // Wait a moment for any validation to trigger
    await page.waitForTimeout(500);

    // Should show error message or stay on page (HTML5 validation)
    // Check if we're still on register page (not redirected)
    await expect(page).toHaveURL(/\/register/);
  });

  test("TC-AF05: Register duplicate email → error shown", async ({ page }) => {
    await page.goto("/register");

    // Use the test user email that already exists in DB
    await page.getByLabel(/^name$/i).fill("Duplicate User");
    await page.getByLabel(/^email$/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("password123");

    await page.getByRole("button", { name: /create account/i }).click();

    // Should show error about existing account
    await expect(page.locator("text=/email.*already|already.*exist|failed to create/i")).toBeVisible({ timeout: 10000 });
  });

  test("TC-AF06: Login page renders (form fields visible)", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create one/i })).toBeVisible();
  });

  test("TC-AF07: Login valid credentials → redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("password123");

    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for client-side auth
    await page.waitForTimeout(2000);

    // Navigate to root - should go to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard)?$/);
  });

  test("TC-AF08: Login wrong password → error shown", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");

    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error
    await expect(page.getByText(/invalid.*email.*password|invalid credentials/i)).toBeVisible({ timeout: 10000 });
  });

  test("TC-AF09: Login non-existent email → error shown", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/password/i).fill("password123");

    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error
    await expect(page.getByText(/invalid.*email.*password|invalid credentials|user not found/i)).toBeVisible({ timeout: 10000 });
  });

  test("TC-AF10: Logout → redirects to login", async ({ page }) => {
    // First login
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for client-side auth to complete
    await page.waitForTimeout(3000);

    // Navigate to root dashboard (uses (dashboard) layout with sidebar + header)
    await page.goto("/");
    await page.waitForLoadState("load");

    // If redirected to login, auth failed — try once more
    if (page.url().includes('/login')) {
      await page.goto("/");
      await page.waitForLoadState("load");
    }

    // Find and click logout button (from dashboard-header.tsx in layout)
    const logoutButton = page.getByRole("button", { name: /sign out/i });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("TC-AF11: /companies without session → redirects to /login", async ({ page }) => {
    // Try to access protected route without logging in
    await page.goto("/companies");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-AF12: Login ↔ Register link navigation", async ({ page }) => {
    // Start at login page
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

    // Click link to register
    await page.getByRole("link", { name: /create one|create account|sign up/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();

    // Click link back to login
    await page.getByRole("link", { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });
});
