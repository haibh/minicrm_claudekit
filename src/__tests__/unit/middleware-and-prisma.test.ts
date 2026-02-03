import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

describe("middleware", () => {
  let middleware: any;
  let getSessionCookie: any;

  beforeEach(async () => {
    vi.resetModules();

    // Mock better-auth/cookies
    getSessionCookie = vi.fn();
    vi.doMock("better-auth/cookies", () => ({
      getSessionCookie,
    }));

    // Import after mocking
    const mod = await import("@/middleware");
    middleware = mod.middleware;
  });

  it("TC-MW01: allows /login without session", async () => {
    getSessionCookie.mockReturnValue(null);

    const request = new NextRequest(new URL("http://localhost/login"));
    const response = await middleware(request);

    expect(response.status).not.toBe(307); // Not a redirect
  });

  it("TC-MW02: allows /register without session", async () => {
    getSessionCookie.mockReturnValue(null);

    const request = new NextRequest(new URL("http://localhost/register"));
    const response = await middleware(request);

    expect(response.status).not.toBe(307);
  });

  it("TC-MW03: allows /api/auth/* without session", async () => {
    getSessionCookie.mockReturnValue(null);

    const request = new NextRequest(new URL("http://localhost/api/auth/session"));
    const response = await middleware(request);

    expect(response.status).not.toBe(307);
  });

  it("TC-MW04: redirects /dashboard to /login when unauthenticated", async () => {
    getSessionCookie.mockReturnValue(null);

    const request = new NextRequest(new URL("http://localhost/dashboard"));
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("TC-MW05: allows /dashboard with session", async () => {
    getSessionCookie.mockReturnValue({ userId: "user-123" });

    const request = new NextRequest(new URL("http://localhost/dashboard"));
    const response = await middleware(request);

    expect(response.status).not.toBe(307);
  });

  it("TC-MW06: redirects / to /dashboard when authenticated", async () => {
    getSessionCookie.mockReturnValue({ userId: "user-123" });

    const request = new NextRequest(new URL("http://localhost/"));
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("TC-MW07: matcher config excludes static files", async () => {
    const { config } = await import("@/middleware");

    expect(config.matcher).toBeDefined();
    // Matcher is an array with pattern string
    expect(config.matcher[0]).toContain("(?!_next");
  });
});

describe("prisma singleton", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("TC-PS01: creates client with adapter", async () => {
    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
  });

  it("TC-PS02: reuses client in dev mode", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const { prisma: prisma1 } = await import("@/lib/prisma");

    // Reset modules but globalThis should keep the instance
    vi.resetModules();

    const { prisma: prisma2 } = await import("@/lib/prisma");

    // In dev, should reuse global instance
    expect(prisma1).toBe(prisma2);

    vi.unstubAllEnvs();
  });

  it("TC-PS03: creates new client in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    // Clear global
    const globalForPrisma = globalThis as any;
    delete globalForPrisma.prisma;

    const { prisma } = await import("@/lib/prisma");

    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();

    vi.unstubAllEnvs();
  });
});
