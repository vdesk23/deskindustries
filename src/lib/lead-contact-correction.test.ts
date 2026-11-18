import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  previousEmail: "typo@example.com",
  updates: [] as Record<string, unknown>[],
  queued: [] as { payload: Record<string, unknown> }[],
  register: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config }));
vi.mock("@react-email/components", () => ({ render: vi.fn().mockResolvedValue("portfolio email") }));
vi.mock("./email-templates/registry", () => ({ TEMPLATES: { "lead-portfolio": { component: () => null, subject: "Portfolio" } } }));
vi.mock("./consus.server", () => ({
  verifyContinuation: vi.fn().mockResolvedValue("existing-lead-id"),
  issueContinuation: vi.fn().mockResolvedValue("updated-token"),
  registerConsusLead: mocks.register,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        single: async () => ({ data: { email: mocks.previousEmail }, error: null }),
        maybeSingle: async () => ({ data: table === "email_unsubscribe_tokens" ? { token: "unsubscribe", used_at: null } : null }),
        update: (contact: Record<string, unknown>) => {
          mocks.updates.push(contact);
          return { eq: async () => ({ error: null }) };
        },
        insert: async () => ({ error: null }),
      };
      return query;
    },
    rpc: async (_name: string, args: { payload: Record<string, unknown> }) => {
      mocks.queued.push(args);
      return { error: null };
    },
  }),
}));

import { Route } from "../routes/api/public/lead-submit";

// The mocked router returns the route configuration directly.
const handler = (Route as unknown as { server: { handlers: { POST: (args: { request: Request }) => Promise<Response> } } }).server.handlers.POST;

describe("correcting an existing commercial lead", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.invalid");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-key");
    mocks.previousEmail = "typo@example.com";
    mocks.updates.length = 0;
    mocks.queued.length = 0;
    mocks.register.mockReset();
    mocks.register.mockResolvedValue(undefined);
  });

  async function correctContact() {
    return handler({ request: new Request("https://example.invalid/api/public/lead-submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", continuation: "existing-token", name: "Maria Rossi", email: "maria@example.com", phone: "3331234567" }),
    }) });
  }

  it("updates the same lead and queues a new portfolio for the corrected recipient", async () => {
    const response = await correctContact();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, continuation: "updated-token" });
    expect(mocks.updates[0]).toMatchObject({ name: "Maria Rossi", email: "maria@example.com", phone: "3331234567" });
    expect(mocks.register).toHaveBeenCalledWith(expect.objectContaining({ leadId: "existing-lead-id", email: "maria@example.com" }));
    expect(mocks.queued).toHaveLength(1);
    expect(mocks.queued[0]?.payload).toMatchObject({ to: "maria@example.com", idempotency_key: "lead-portfolio-existing-lead-id-maria@example.com" });
  });

  it("does not queue another portfolio when only name or phone changes", async () => {
    mocks.previousEmail = "MARIA@example.com";
    expect((await correctContact()).status).toBe(200);
    expect(mocks.updates).toHaveLength(1);
    expect(mocks.queued).toHaveLength(0);
  });

  it("keeps the correction and a continuation when CONSUS is unavailable", async () => {
    mocks.register.mockRejectedValue(new Error("unavailable"));
    const response = await correctContact();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ continuation: "updated-token" });
    expect(mocks.updates[0]?.email).toBe("maria@example.com");
    expect(mocks.queued[0]?.payload.to).toBe("maria@example.com");
  });
});