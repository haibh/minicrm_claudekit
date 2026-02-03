import "@testing-library/jest-dom/vitest";

// Set up test environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret-for-unit-tests";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
