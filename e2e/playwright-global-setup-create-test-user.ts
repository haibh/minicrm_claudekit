/**
 * Playwright Global Setup
 * Creates test user before all E2E tests run
 *
 * Note: We use fetch to call the Better Auth API endpoint directly
 * to avoid ES module issues with Prisma in global setup
 */

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";
const TEST_NAME = "Test User";

async function globalSetup() {
  console.log("🔧 Global setup: Ensuring test user exists...");

  // Wait for dev server to be ready (webServer should start it)
  const maxRetries = 30;
  let serverReady = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          name: TEST_NAME,
        }),
      });

      if (response.ok || response.status === 400) {
        // 200 = created, 400 = already exists
        serverReady = true;
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          console.log(`✅ Test user created: ${TEST_EMAIL}`);
        } else if (data?.error?.message?.includes("exist")) {
          console.log(`✅ Test user ${TEST_EMAIL} already exists`);
        } else {
          console.log(`✅ Test user setup complete (status: ${response.status})`);
        }
        break;
      }
    } catch (error) {
      // Server not ready yet, wait
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!serverReady) {
    console.warn("⚠️ Could not verify test user setup - server may not be ready");
  }
}

export default globalSetup;
