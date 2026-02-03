/**
 * Auth mock helper — mocks Better Auth session for server actions.
 * Use mockAuthenticatedSession() for logged-in user scenarios.
 * Use mockUnauthenticatedSession() for unauthorized scenarios.
 */
import { vi } from "vitest";

export const TEST_USER = {
  id: "test-user-id-001",
  name: "Test User",
  email: "test@example.com",
};

export function mockAuthenticatedSession() {
  return {
    session: { id: "session-001", userId: TEST_USER.id },
    user: TEST_USER,
  };
}

export function mockUnauthenticatedSession() {
  return null;
}

/** Creates mock for next/headers */
export function createMockHeaders() {
  return vi.fn().mockResolvedValue(new Headers());
}

/** Creates mock for next/cache revalidatePath */
export function createMockRevalidatePath() {
  return vi.fn();
}

/** Creates mock for next/navigation redirect */
export function createMockRedirect() {
  // redirect() in Next.js throws a NEXT_REDIRECT error
  return vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
}
